import { Menu, BrowserWindow, app, MenuItemConstructorOptions } from 'electron';

export function buildMenu(win: BrowserWindow): Menu {
  const sendAction = (action: string) => win.webContents.send('menu:action', action);

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        { label: 'New File', accelerator: 'CmdOrCtrl+N', click: () => sendAction('file:new') },
        { label: 'Open File...', accelerator: 'CmdOrCtrl+O', click: () => sendAction('file:open') },
        { label: 'Open Folder...', accelerator: 'CmdOrCtrl+K CmdOrCtrl+O', click: () => sendAction('file:openFolder') },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => sendAction('file:save') },
        { label: 'Save As...', accelerator: 'CmdOrCtrl+Shift+S', click: () => sendAction('file:saveAs') },
        { label: 'Save All', accelerator: 'CmdOrCtrl+K S', click: () => sendAction('file:saveAll') },
        { type: 'separator' },
        { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: () => sendAction('file:closeTab') },
        { type: 'separator' },
        { label: 'Exit', accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4', click: () => app.quit() },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { type: 'separator' },
        { label: 'Find', accelerator: 'CmdOrCtrl+F', click: () => sendAction('edit:find') },
        { label: 'Find & Replace', accelerator: 'CmdOrCtrl+H', click: () => sendAction('edit:replace') },
        { type: 'separator' },
        { label: 'Toggle Comment', accelerator: 'CmdOrCtrl+/', click: () => sendAction('edit:toggleComment') },
        { label: 'Format Document', accelerator: 'Shift+Alt+F', click: () => sendAction('edit:format') },
      ],
    },
    {
      label: 'Selection',
      submenu: [
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
        { label: 'Expand Selection', accelerator: 'Alt+Shift+Right', click: () => sendAction('selection:expand') },
        { label: 'Shrink Selection', accelerator: 'Alt+Shift+Left', click: () => sendAction('selection:shrink') },
        { type: 'separator' },
        { label: 'Add Cursor Above', accelerator: 'Ctrl+Alt+Up', click: () => sendAction('selection:addCursorAbove') },
        { label: 'Add Cursor Below', accelerator: 'Ctrl+Alt+Down', click: () => sendAction('selection:addCursorBelow') },
        { label: 'Select Next Occurrence', accelerator: 'CmdOrCtrl+D', click: () => sendAction('selection:nextOccurrence') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Command Palette...', accelerator: 'CmdOrCtrl+Shift+P', click: () => sendAction('view:commandPalette') },
        { type: 'separator' },
        { label: 'Toggle Sidebar', accelerator: 'CmdOrCtrl+B', click: () => sendAction('view:toggleSidebar') },
        { label: 'Toggle Terminal', accelerator: 'CmdOrCtrl+`', click: () => sendAction('view:toggleTerminal') },
        { label: 'Toggle AI Chat', accelerator: 'CmdOrCtrl+Shift+L', click: () => sendAction('view:toggleAI') },
        { type: 'separator' },
        { label: 'Toggle Dark/Light Theme', accelerator: 'CmdOrCtrl+K CmdOrCtrl+T', click: () => sendAction('view:toggleTheme') },
        { label: 'Toggle Minimap', click: () => sendAction('view:toggleMinimap') },
        { label: 'Toggle Word Wrap', accelerator: 'Alt+Z', click: () => sendAction('view:toggleWordWrap') },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Toggle Full Screen', accelerator: 'F11', role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Terminal',
      submenu: [
        { label: 'New Terminal', accelerator: 'CmdOrCtrl+Shift+`', click: () => sendAction('terminal:new') },
        { label: 'Kill Terminal', click: () => sendAction('terminal:kill') },
        { label: 'Clear Terminal', click: () => sendAction('terminal:clear') },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About OpenCode Studio', click: () => sendAction('help:about') },
        { label: 'Toggle Developer Tools', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  return Menu.buildFromTemplate(template);
}
