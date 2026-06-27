<div align="center">
  <img src="https://raw.githubusercontent.com/Opsec-6209/opsec_6209-studio/main/assets/icon.ico" width="80" />
  <h1>OpSec_6209 Studio</h1>
  <p>A modern, lightweight code editor powered by <strong>Monaco</strong> (VS Code's engine) with 80+ language support, AI assistant, integrated terminal, and a clean design aesthetic.</p>
</div>

<br>

## Features

- **Monaco Editor** — The exact same editor engine that powers VS Code. Syntax highlighting, IntelliSense, minimap, multi-cursor, bracket matching, auto-close tags, and more for 80+ languages.
- **File Explorer** — Sidebar tree view with create, rename, delete, and context menus. Auto-refreshes on file changes.
- **Tab Management** — Multi-tab editing with dirty indicators, middle-click close, drag-to-reorder, and recently closed tab recovery.
- **Integrated Terminal** — Multi-tab terminal with xterm.js. Spawns your system shell.
- **AI Chat** — Sidebar AI assistant with streaming responses, markdown rendering, code block highlighting, and configurable API endpoint.
- **Command Palette** — `Ctrl+Shift+P` quick action search. Also: search across files with regex, keyboard shortcut reference.
- **Git Integration** — Branch name in status bar, file status indicators (modified, added, deleted, untracked).
- **Dark & Light Themes** — Full design system with CSS custom properties, smooth transitions, and animation curves.
- **Settings UI** — Tabbed settings panel (Editor, Appearance, Terminal, AI).
- **Zen Mode** — `F11` distraction-free editing.
- **Drag & Drop** — Drop files and folders from your OS directly into the editor.
- **60+ SVG Language Icons** — Colored badges for every file type.
- **Code Snippets** — Built-in snippets for JS/TS, Python, HTML, CSS. Emmet-like HTML expansion.
- **Format Document** — `Shift+Alt+F` for supported languages.
- **Go to Definition** — `F12` for TypeScript/JavaScript.
- **Custom Titlebar** — Frameless window with native controls.
- **Toast Notifications** — Success/error/info toasts for file operations.
- **Save Confirmation** — Prompts on close if you have unsaved changes.
- **Recently Opened** — Quick access to your last 20 files.
- **Breadcrumb Bar** — Clickable path segments above the editor.

<br>

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | **Electron** (TypeScript) |
| Editor Engine | **Monaco Editor** (same as VS Code) |
| UI Framework | **Preact** + **htm** |
| Terminal | **xterm.js** |
| Bundler | **Vite** + esbuild |
| Language Support | 80+ TextMate grammars |
| Package Manager | npm + electron-builder |

<br>

## Quick Start

```bash
# Clone
git clone https://github.com/Opsec-6209/opsec_6209-studio.git
cd opsec_6209-studio

# Install
npm install

# Run
npm start

# Build .exe
npm run dist
```

<br>

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New file |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save |
| `Ctrl+Shift+S` | Save as |
| `Ctrl+W` | Close tab |
| `Ctrl+Shift+T` | Reopen closed tab |
| `Ctrl+F` | Find in file |
| `Ctrl+Shift+F` | Search across files |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+\`` | Toggle terminal |
| `Ctrl+Shift+L` | Toggle AI chat |
| `F11` | Zen mode |
| `F12` | Go to definition |
| `Shift+Alt+F` | Format document |
| `Ctrl+K Ctrl+S` | Keyboard shortcuts reference |

<br>

## Project Structure

```
src/
├── main/                  # Electron main process
│   ├── main.ts            # App lifecycle, window
│   ├── preload.ts         # Secure IPC bridge
│   ├── menu.ts            # Native menu bar
│   └── ipc/               # IPC handlers
│       ├── file-system.ts # File/directory operations
│       ├── dialog.ts      # Open/save dialogs
│       ├── terminal.ts    # Shell process spawner
│       ├── settings.ts    # JSON settings store
│       ├── ai.ts          # AI API proxy
│       └── git.ts         # Git status/branch
├── renderer/              # Browser-side UI
│   ├── index.html         # Entry HTML with CSP
│   ├── index.tsx          # App mount point
│   ├── components/        # 18 UI components
│   ├── hooks/             # 5 custom hooks
│   ├── services/          # Monaco setup, IPC client, icons
│   └── styles/            # Design tokens, animations, CSS
└── shared/
    └── types.ts           # Shared TypeScript interfaces
```

<br>

## Design System

Built with a custom design system inspired by Vercel, Linear, and Apple aesthetics.

- **Fonts:** Inter (UI) + JetBrains Mono (code)
- **Colors:** Dark and light themes with CSS custom properties
- **Animations:** Spring and smooth easing curves, staggered entrance animations
- **Components:** 18 Preact components with consistent styling

<br>

## License

MIT — feel free to use, modify, and distribute.
