import { contextBridge, ipcRenderer, webUtils } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  readDir: (dirPath: string) => ipcRenderer.invoke('fs:readDir', dirPath),
  createFile: (parentPath: string, name: string) => ipcRenderer.invoke('fs:createFile', parentPath, name),
  createDir: (parentPath: string, name: string) => ipcRenderer.invoke('fs:createDir', parentPath, name),
  deletePath: (targetPath: string) => ipcRenderer.invoke('fs:deletePath', targetPath),
  renamePath: (oldPath: string, newPath: string) => ipcRenderer.invoke('fs:renamePath', oldPath, newPath),
  fileExists: (filePath: string) => ipcRenderer.invoke('fs:fileExists', filePath),
  getFileInfo: (filePath: string) => ipcRenderer.invoke('fs:getFileInfo', filePath),
  replaceInFile: (filePath: string, search: string, replace: string, regex: boolean, caseSensitive: boolean) =>
    ipcRenderer.invoke('fs:replaceInFile', filePath, search, replace, regex, caseSensitive),

  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  saveFileDialog: (defaultName?: string) => ipcRenderer.invoke('dialog:saveFile', defaultName),

  loadSettings: () => ipcRenderer.invoke('settings:load'),
  saveSettings: (settings: any) => ipcRenderer.invoke('settings:save', settings),
  getAppPath: () => ipcRenderer.invoke('settings:getAppPath'),

  spawnTerminal: (id: string, cols: number, rows: number) =>
    ipcRenderer.invoke('terminal:spawn', id, cols, rows),
  writeTerminal: (id: string, data: string) =>
    ipcRenderer.invoke('terminal:write', id, data),
  resizeTerminal: (id: string, cols: number, rows: number) =>
    ipcRenderer.invoke('terminal:resize', id, cols, rows),
  killTerminal: (id: string) => ipcRenderer.invoke('terminal:kill', id),
  onTerminalData: (callback: (id: string, data: string) => void) => {
    const handler = (_event: any, id: string, data: string) => callback(id, data);
    ipcRenderer.on('terminal:data', handler);
    return () => ipcRenderer.removeListener('terminal:data', handler);
  },
  onTerminalExit: (callback: (id: string, code: number) => void) => {
    const handler = (_event: any, id: string, code: number) => callback(id, code);
    ipcRenderer.on('terminal:exit', handler);
    return () => ipcRenderer.removeListener('terminal:exit', handler);
  },

  aiChat: (messages: any[], apiKey: string, model: string, endpoint: string) =>
    ipcRenderer.invoke('ai:chat', messages, apiKey, model, endpoint),
  aiChatStream: (messages: any[], apiKey: string, model: string, endpoint: string) => {
    const channel = `ai:stream-${Date.now()}`;
    ipcRenderer.send('ai:chatStream', messages, apiKey, model, endpoint, channel);
    return {
      onData: (callback: (chunk: string) => void) => {
        const handler = (_event: any, data: string) => callback(data);
        ipcRenderer.on(channel, handler);
        return () => ipcRenderer.removeListener(channel, handler);
      },
      onEnd: (callback: () => void) => {
        const handler = () => callback();
        ipcRenderer.on(`${channel}:end`, handler);
        return () => ipcRenderer.removeListener(`${channel}:end`, handler);
      },
    };
  },

  onMenuAction: (callback: (action: string) => void) => {
    const handler = (_event: any, action: string) => callback(action);
    ipcRenderer.on('menu:action', handler);
    return () => ipcRenderer.removeListener('menu:action', handler);
  },

  setTitle: (title: string) => ipcRenderer.invoke('window:setTitle', title),

  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onMaximizeChange: (callback: (maximized: boolean) => void) => {
    const handler = (_event: any, maximized: boolean) => callback(maximized);
    ipcRenderer.on('window:maximize-change', handler);
    return () => ipcRenderer.removeListener('window:maximize-change', handler);
  },

  gitStatus: (dirPath: string) => ipcRenderer.invoke('git:status', dirPath),
  gitBranch: (dirPath: string) => ipcRenderer.invoke('git:branch', dirPath),

  getFilePath: (file: File) => webUtils.getPathForFile(file),

  addRecentFile: (filePath: string) => ipcRenderer.invoke('fs:addRecentFile', filePath),

  watchFolder: (rootPath: string) => ipcRenderer.invoke('fs:watchFolder', rootPath),
  unwatchFolder: () => ipcRenderer.invoke('fs:unwatchFolder'),
  onFileTreeChanged: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('file-tree:changed', handler);
    return () => ipcRenderer.removeListener('file-tree:changed', handler);
  },

  onBeforeClose: (callback: (respond: (dirty: boolean) => void) => void) => {
    const handler = () => {
      callback((dirty: boolean) => {
        ipcRenderer.send('window:dirtyResponse', dirty);
      });
    };
    ipcRenderer.on('window:queryDirty', handler);
    return () => ipcRenderer.removeListener('window:queryDirty', handler);
  },
});
