import { ipcMain } from 'electron';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function findGitDir(dirPath: string): string | null {
  let current = dirPath;
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(current, '.git'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
  return null;
}

function runGit(args: string, cwd: string): string | null {
  try {
    return execSync(`git ${args}`, { cwd, encoding: 'utf-8', windowsHide: true, timeout: 10000 }).trim();
  } catch {
    return null;
  }
}

export function setupGitIPC(): void {
  ipcMain.handle('git:status', (_event, dirPath: string) => {
    try {
      execSync('git --version', { stdio: 'ignore', timeout: 5000 });
    } catch {
      return null;
    }

    const gitRoot = findGitDir(dirPath);
    if (!gitRoot) return null;

    const output = runGit('status --porcelain', gitRoot);
    if (output === null || output === '') return {};

    const statuses: Record<string, { status: 'modified' | 'added' | 'deleted' | 'untracked' }> = {};

    for (const line of output.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const code = line.substring(0, 2).trim();
      const file = line.substring(3).trim();

      if (file.includes(' -> ')) {
        const newPath = file.split(' -> ')[1];
        const fullPath = path.join(gitRoot, newPath).replace(/\\/g, '/');
        statuses[fullPath] = { status: 'modified' };
        continue;
      }

      const fullPath = path.join(gitRoot, file).replace(/\\/g, '/');

      if (code === '??') {
        statuses[fullPath] = { status: 'untracked' };
      } else if (code.includes('M')) {
        statuses[fullPath] = { status: 'modified' };
      } else if (code.includes('A')) {
        statuses[fullPath] = { status: 'added' };
      } else if (code.includes('D')) {
        statuses[fullPath] = { status: 'deleted' };
      }
    }

    return statuses;
  });

  ipcMain.handle('git:branch', (_event, dirPath: string) => {
    const gitRoot = findGitDir(dirPath);
    if (!gitRoot) return null;

    const branch = runGit('branch --show-current', gitRoot);
    if (branch === null || branch === '') {
      const head = runGit('rev-parse --short HEAD', gitRoot);
      return head ? `HEAD@${head}` : null;
    }
    return branch;
  });
}
