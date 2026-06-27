import { ipcMain, BrowserWindow } from 'electron';
import { spawn as cpSpawn, ChildProcess } from 'child_process';

const terminals = new Map<string, ChildProcess>();

export function cleanupTerminals(): void {
  terminals.forEach((proc) => { try { proc.kill(); } catch {} });
  terminals.clear();
}

export function setupTerminalIPC(): void {
  ipcMain.handle('terminal:spawn', (event, id: string, _cols: number, _rows: number, cwd?: string) => {
    if (terminals.has(id)) {
      try { terminals.get(id)?.kill(); } catch {}
      terminals.delete(id);
    }

    const shell = process.platform === 'win32'
      ? process.env.ComSpec || 'cmd.exe'
      : process.env.SHELL || '/bin/bash';

    const win = BrowserWindow.fromWebContents(event.sender);
    const proc = cpSpawn(shell, [], {
      cwd: cwd || process.cwd(),
      env: process.env as Record<string, string>,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    proc.stdout?.on('data', (data: Buffer) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('terminal:data', id, data.toString());
      }
    });

    proc.stderr?.on('data', (data: Buffer) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('terminal:data', id, data.toString());
      }
    });

    proc.on('exit', (code) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('terminal:exit', id, code);
      }
      terminals.delete(id);
    });

    proc.on('error', (err) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('terminal:data', id, `\r\nError: ${err.message}\r\n`);
        win.webContents.send('terminal:exit', id, -1);
      }
      terminals.delete(id);
    });

    terminals.set(id, proc);
    return true;
  });

  ipcMain.handle('terminal:write', (_event, id: string, data: string) => {
    const proc = terminals.get(id);
    if (proc?.stdin?.writable) {
      proc.stdin.write(data);
      return true;
    }
    return false;
  });

  ipcMain.handle('terminal:resize', () => {
    return true;
  });

  ipcMain.handle('terminal:kill', (_event, id: string) => {
    const proc = terminals.get(id);
    if (proc) {
      try { proc.kill(); } catch {}
      terminals.delete(id);
      return true;
    }
    return false;
  });
}
