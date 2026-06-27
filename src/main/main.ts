import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import * as path from 'path';
import { buildMenu } from './menu';
import { setupFileSystemIPC } from './ipc/file-system';
import { setupDialogIPC } from './ipc/dialog';
import { setupSettingsIPC } from './ipc/settings';
import { setupTerminalIPC, cleanupTerminals } from './ipc/terminal';
import { setupAIIPC } from './ipc/ai';
import { setupGitIPC } from './ipc/git';

let mainWindow: BrowserWindow | null = null;
let forceQuitting = false;
let closeInProgress = false;

function setupWindowIPC(): void {
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
  });
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.handle('window:close', () => {
    mainWindow?.close();
  });
  ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized() ?? false;
  });
  ipcMain.handle('window:setTitle', (_event, title: string) => {
    if (mainWindow) mainWindow.setTitle(title);
  });
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 500,
    title: 'OpenCode Studio',
    backgroundColor: '#fafafa',
    show: false,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
    },
    icon: path.join(__dirname, '../../assets/icon.ico'),
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximize-change', true);
  });
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximize-change', false);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  const menu = buildMenu(mainWindow);
  Menu.setApplicationMenu(menu);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
  }

  mainWindow.on('close', async (event) => {
    if (!mainWindow || forceQuitting) return;
    if (closeInProgress) return;
    closeInProgress = true;
    event.preventDefault();

    mainWindow.webContents.send('window:queryDirty');

    const hasDirty = await new Promise<boolean>((resolve) => {
      const handler = (_e: any, dirty: boolean) => {
        ipcMain.removeListener('window:dirtyResponse', handler);
        resolve(dirty);
      };
      ipcMain.on('window:dirtyResponse', handler);
      setTimeout(() => {
        ipcMain.removeListener('window:dirtyResponse', handler);
        resolve(false);
      }, 3000);
    });

    const doClose = () => {
      forceQuitting = true;
      mainWindow?.close();
    };

    if (hasDirty) {
      const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'warning',
        buttons: ['Save All', 'Discard', 'Cancel'],
        defaultId: 0,
        cancelId: 2,
        message: 'You have unsaved changes.',
        detail: 'Do you want to save them before closing?',
      });

      if (response === 0) {
        mainWindow.webContents.send('menu:action', 'file:saveAll');
        setTimeout(() => doClose(), 500);
      } else if (response === 1) {
        doClose();
      } else {
        closeInProgress = false;
      }
    } else {
      doClose();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupFileSystemIPC();
  setupDialogIPC();
  setupSettingsIPC();
  setupTerminalIPC();
  setupAIIPC();
  setupWindowIPC();
  setupGitIPC();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      forceQuitting = false;
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  cleanupTerminals();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
