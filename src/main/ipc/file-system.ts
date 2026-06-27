import { ipcMain, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { FileNode } from '../../shared/types';
import { getSettings, saveToDisk } from './settings';

function buildFileTree(dirPath: string, depth = 0): FileNode[] {
  if (depth > 10) return [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    const dirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules');
    const files = entries.filter(e => e.isFile());

    for (const d of dirs.sort((a, b) => a.name.localeCompare(b.name))) {
      const fullPath = path.join(dirPath, d.name);
      nodes.push({
        name: d.name,
        path: fullPath,
        type: 'directory',
        children: buildFileTree(fullPath, depth + 1),
        expanded: depth < 2,
      });
    }

    for (const f of files.sort((a, b) => a.name.localeCompare(b.name))) {
      nodes.push({
        name: f.name,
        path: path.join(dirPath, f.name),
        type: 'file',
      });
    }

    return nodes;
  } catch {
    return [];
  }
}

export function setupFileSystemIPC(): void {
  ipcMain.handle('fs:readFile', (_event, filePath: string) => {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (e: any) {
      throw new Error(`Cannot read file: ${e.message}`);
    }
  });

  ipcMain.handle('fs:writeFile', (_event, filePath: string, content: string) => {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    } catch (e: any) {
      throw new Error(`Cannot write file: ${e.message}`);
    }
  });

  ipcMain.handle('fs:readDir', (_event, dirPath: string) => {
    return buildFileTree(dirPath);
  });

  ipcMain.handle('fs:createFile', (_event, parentPath: string, name: string) => {
    const fullPath = path.join(parentPath, name);
    if (fs.existsSync(fullPath)) throw new Error('File already exists');
    fs.writeFileSync(fullPath, '', 'utf-8');
    return fullPath;
  });

  ipcMain.handle('fs:createDir', (_event, parentPath: string, name: string) => {
    const fullPath = path.join(parentPath, name);
    if (fs.existsSync(fullPath)) throw new Error('Directory already exists');
    fs.mkdirSync(fullPath, { recursive: true });
    return fullPath;
  });

  ipcMain.handle('fs:deletePath', (_event, targetPath: string) => {
    try {
      const stat = fs.statSync(targetPath);
      if (stat.isDirectory()) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(targetPath);
      }
      return true;
    } catch (e: any) {
      throw new Error(`Cannot delete: ${e.message}`);
    }
  });

  ipcMain.handle('fs:renamePath', (_event, oldPath: string, newPath: string) => {
    try {
      fs.renameSync(oldPath, newPath);
      return newPath;
    } catch (e: any) {
      throw new Error(`Cannot rename: ${e.message}`);
    }
  });

  ipcMain.handle('fs:fileExists', (_event, filePath: string) => {
    return fs.existsSync(filePath);
  });

  ipcMain.handle('fs:getFileInfo', (_event, filePath: string) => {
    try {
      const stat = fs.statSync(filePath);
      return {
        name: path.basename(filePath),
        path: filePath,
        size: stat.size,
        modified: stat.mtime.toISOString(),
        isDirectory: stat.isDirectory(),
      };
    } catch {
      return null;
    }
  });

  ipcMain.handle('fs:addRecentFile', (_event, filePath: string) => {
    const s = getSettings();
    const recent = s.recentFiles.filter(f => f !== filePath);
    recent.unshift(filePath);
    s.recentFiles = recent.slice(0, 20);
    saveToDisk(s);
  });

  ipcMain.handle('fs:replaceInFile', (_event, filePath: string, search: string, replace: string, regex: boolean, caseSensitive: boolean) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      let newContent: string;
      if (regex) {
        const flags = caseSensitive ? 'g' : 'gi';
        const re = new RegExp(search, flags);
        newContent = content.replace(re, replace);
      } else if (caseSensitive) {
        newContent = content.split(search).join(replace);
      } else {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(escaped, 'gi');
        newContent = content.replace(re, replace);
      }
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
      }
      return true;
    } catch (e: any) {
      throw new Error(`Cannot replace in file: ${e.message}`);
    }
  });

  let watcher: fs.FSWatcher | null = null;
  let watchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  ipcMain.handle('fs:watchFolder', (_event, rootPath: string) => {
    if (watcher) {
      watcher.close();
      watcher = null;
    }
    try {
      watcher = fs.watch(rootPath, { recursive: true }, () => {
        if (watchDebounceTimer) clearTimeout(watchDebounceTimer);
        watchDebounceTimer = setTimeout(() => {
          const win = BrowserWindow.getAllWindows()[0];
          if (win && !win.isDestroyed()) {
            win.webContents.send('file-tree:changed');
          }
        }, 500);
      });
    } catch {}
  });

  ipcMain.handle('fs:unwatchFolder', () => {
    if (watcher) {
      watcher.close();
      watcher = null;
    }
    if (watchDebounceTimer) {
      clearTimeout(watchDebounceTimer);
      watchDebounceTimer = null;
    }
  });
}
