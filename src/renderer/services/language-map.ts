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

const SPECIAL_FILES: Record<string, string> = {
  'dockerfile': 'dockerfile',
  'makefile': 'makefile',
  'gemfile': 'ruby',
  'rakefile': 'ruby',
  'procfile': 'plaintext',
  'vagrantfile': 'ruby',
};

export function getLanguageForFile(filePath: string): string {
  const fileName = filePath.split(/[/\\]/).pop() || '';
  const lowerName = fileName.toLowerCase();

  if (SPECIAL_FILES[lowerName]) {
    return SPECIAL_FILES[lowerName];
  }

  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  return LANGUAGE_MAP[ext] || 'plaintext';
}
