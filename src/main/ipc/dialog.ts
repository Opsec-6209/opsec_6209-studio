import { ipcMain, dialog, BrowserWindow } from 'electron';

export function setupDialogIPC(): void {
  ipcMain.handle('dialog:openFile', async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
      title: 'Open File',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Web', extensions: ['html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json'] },
        { name: 'Code', extensions: ['py', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'rb', 'php', 'swift'] },
      ],
    });

    return result.canceled ? null : result.filePaths;
  });

  ipcMain.handle('dialog:openFolder', async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
      title: 'Open Folder',
      properties: ['openDirectory'],
    });

    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('dialog:saveFile', async (_event, defaultName?: string) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;

    const result = await dialog.showSaveDialog(win, {
      title: 'Save File As',
      defaultPath: defaultName || 'untitled.txt',
      filters: [
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    return result.canceled ? null : result.filePath;
  });
}
