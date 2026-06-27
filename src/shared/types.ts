export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  expanded?: boolean;
}

export interface EditorTab {
  id: string;
  path: string;
  name: string;
  language: string;
  content: string;
  savedContent: string;
  isDirty: boolean;
}

export interface SearchResult {
  file: string;
  line: number;
  column: number;
  lineContent: string;
  matchLength: number;
}

export interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: 'off' | 'on' | 'wordWrapColumn';
  wordWrapColumn: number;
  minimap: boolean;
  autoSave: boolean;
  recentFiles: string[];
  terminal: {
    fontSize: number;
    shell: string;
  };
  ai: {
    provider: string;
    apiKey: string;
    model: string;
    endpoint: string;
  };
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  tabSize: 2,
  wordWrap: 'off',
  wordWrapColumn: 80,
  minimap: true,
  autoSave: false,
  recentFiles: [],
  terminal: {
    fontSize: 13,
    shell: '',
  },
  ai: {
    provider: 'opencode',
    apiKey: '',
    model: 'gpt-4',
    endpoint: 'https://api.openai.com/v1/chat/completions',
  },
};

export const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'typescriptreact',
  '.js': 'javascript', '.jsx': 'javascriptreact',
  '.mjs': 'javascript', '.cjs': 'javascript',
  '.json': 'json', '.jsonc': 'jsonc',
  '.html': 'html', '.htm': 'html',
  '.css': 'css', '.scss': 'scss', '.less': 'less',
  '.md': 'markdown', '.mdx': 'markdown',
  '.py': 'python', '.pyw': 'python',
  '.java': 'java',
  '.c': 'c', '.h': 'c',
  '.cpp': 'cpp', '.cxx': 'cpp', '.cc': 'cpp', '.hpp': 'cpp',
  '.cs': 'csharp',
  '.go': 'go',
  '.rs': 'rust',
  '.rb': 'ruby',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin', '.kts': 'kotlin',
  '.scala': 'scala',
  '.dart': 'dart',
  '.lua': 'lua',
  '.r': 'r',
  '.pl': 'perl', '.pm': 'perl',
  '.sh': 'shell', '.bash': 'shell', '.zsh': 'shell',
  '.ps1': 'powershell', '.psm1': 'powershell',
  '.bat': 'bat', '.cmd': 'bat',
  '.sql': 'sql',
  '.xml': 'xml', '.svg': 'xml',
  '.yaml': 'yaml', '.yml': 'yaml',
  '.toml': 'ini',
  '.ini': 'ini', '.cfg': 'ini',
  '.dockerfile': 'dockerfile',
  '.gitignore': 'ignore',
  '.env': 'plaintext',
  '.graphql': 'graphql', '.gql': 'graphql',
  '.vue': 'html',
  '.svelte': 'html',
  '.hs': 'haskell',
  '.elm': 'elm',
  '.clj': 'clojure', '.cljs': 'clojure',
  '.ex': 'elixir', '.exs': 'elixir',
  '.erl': 'erlang',
  '.fs': 'fsharp', '.fsx': 'fsharp',
  '.vb': 'vb',
  '.coffee': 'coffeescript',
  '.pug': 'pug', '.jade': 'pug',
  '.styl': 'stylus',
  '.tex': 'latex',
  '.makefile': 'makefile', '.mk': 'makefile',
  '.cmake': 'cmake',
};
