import type { FileNode, SearchResult, Settings, AIMessage } from '../shared/types';

export interface ElectronAPI {
  readFile(filePath: string): Promise<string>;
  writeFile(filePath: string, content: string): Promise<boolean>;
  readDir(dirPath: string): Promise<FileNode[]>;
  createFile(parentPath: string, name: string): Promise<string>;
  createDir(parentPath: string, name: string): Promise<string>;
  deletePath(targetPath: string): Promise<boolean>;
  renamePath(oldPath: string, newPath: string): Promise<string>;
  fileExists(filePath: string): Promise<boolean>;
  getFileInfo(filePath: string): Promise<{ name: string; path: string; size: number; modified: string; isDirectory: boolean } | null>;
  replaceInFile(filePath: string, search: string, replace: string, regex: boolean, caseSensitive: boolean): Promise<boolean>;

  openFileDialog(): Promise<string[] | null>;
  openFolderDialog(): Promise<string | null>;
  saveFileDialog(defaultName?: string): Promise<string | null>;

  loadSettings(): Promise<Settings>;
  saveSettings(settings: Partial<Settings>): Promise<Settings>;
  getAppPath(): Promise<string>;

  spawnTerminal(id: string, cols: number, rows: number): Promise<boolean>;
  writeTerminal(id: string, data: string): Promise<boolean>;
  resizeTerminal(id: string, cols: number, rows: number): Promise<boolean>;
  killTerminal(id: string): Promise<boolean>;
  onTerminalData(callback: (id: string, data: string) => void): () => void;
  onTerminalExit(callback: (id: string, code: number) => void): () => void;

  aiChat(messages: AIMessage[], apiKey: string, model: string, endpoint: string): Promise<string>;
  aiChatStream(messages: AIMessage[], apiKey: string, model: string, endpoint: string): {
    onData(callback: (chunk: string) => void): () => void;
    onEnd(callback: () => void): () => void;
  };

  onMenuAction(callback: (action: string) => void): () => void;
  setTitle(title: string): Promise<void>;
  minimizeWindow(): Promise<void>;
  maximizeWindow(): Promise<void>;
  closeWindow(): Promise<void>;
  isMaximized(): Promise<boolean>;
  onMaximizeChange(callback: (maximized: boolean) => void): () => void;

  gitStatus(dirPath: string): Promise<Record<string, { status: 'modified' | 'added' | 'deleted' | 'untracked' }> | null>;
  gitBranch(dirPath: string): Promise<string | null>;

  getFilePath(file: File): string;

  addRecentFile(filePath: string): Promise<void>;

  watchFolder(rootPath: string): Promise<void>;
  unwatchFolder(): Promise<void>;
  onFileTreeChanged(callback: () => void): () => void;

  onBeforeClose(callback: (respond: (dirty: boolean) => void) => void): () => void;
  send(channel: string, ...args: any[]): void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export function getAPI(): ElectronAPI {
  if (!window.electronAPI) {
    throw new Error('electronAPI not available - running outside Electron?');
  }
  return window.electronAPI;
}
