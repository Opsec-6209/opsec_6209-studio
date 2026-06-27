import * as monaco from 'monaco-editor';

let initialized = false;

/* ───────── Emmet-like HTML expansion ───────── */

function parseEmmet(expr: string): string | null {
  let pos = 0;
  const n = expr.length;

  const peek = (): string => (pos < n ? expr[pos] : '');
  const consume = (ch: string): boolean => { if (peek() === ch) { pos++; return true; } return false; };

  const parseName = (): string => {
    const m = expr.slice(pos).match(/^[a-zA-Z][a-zA-Z0-9]*/);
    if (m) { pos += m[0].length; return m[0]; }
    return '';
  };

  const parseNumber = (): number => {
    const m = expr.slice(pos).match(/^\d+/);
    if (m) { pos += m[0].length; return parseInt(m[0], 10); }
    return 1;
  };

  const parseAttrs = (): string => {
    let result = '';
    while (consume('[')) {
      const end = expr.indexOf(']', pos);
      if (end === -1) break;
      const content = expr.slice(pos, end);
      pos = end + 1;
      const eqIdx = content.indexOf('=');
      if (eqIdx >= 0) {
        result += ` ${content.slice(0, eqIdx)}="${content.slice(eqIdx + 1)}"`;
      } else {
        result += ` ${content}=""`;
      }
    }
    return result;
  };

  /* atom := name? ('#' name)? ('.' name)* ('[' [^\\]]* ']')* */
  const parseAtom = (): { tag: string; id: string; classes: string[]; attrs: string } | null => {
    const start = pos;
    let tag = parseName();
    let id = '';
    const classes: string[] = [];
    if (consume('#')) id = parseName();
    while (consume('.')) classes.push(parseName());
    const attrs = parseAttrs();
    /* must have consumed at least one token */
    if (pos === start) return null;
    if (!tag) tag = 'div';
    return { tag, id, classes, attrs };
  };

  const render = (a: { tag: string; id: string; classes: string[]; attrs: string }, inner: string): string => {
    let attrStr = '';
    if (a.id) attrStr += ` id="${a.id}"`;
    if (a.classes.length) attrStr += ` class="${a.classes.join(' ')}"`;
    attrStr += a.attrs;
    return `<${a.tag}${attrStr}>${inner}</${a.tag}>`;
  };

  /* element := atom ('*' number)? ('>' element)?               */
  /* (the * repeats the whole element including its children)    */
  const parseElement = (): string | null => {
    const atom = parseAtom();
    if (!atom) return null;
    let count = 1;
    if (consume('*')) count = parseNumber();
    let inner = '';
    if (consume('>')) {
      const child = parseElement();
      if (!child) return null;
      inner = child;
    }
    const one = render(atom, inner);
    let result = '';
    for (let i = 0; i < count; i++) result += one;
    return result;
  };

  /* expression := element ('+' element)* */
  const parseExpression = (): string | null => {
    const first = parseElement();
    if (!first) return null;
    let result = first;
    while (consume('+')) {
      const next = parseElement();
      if (!next) return null;
      result += next;
    }
    return result;
  };

  const parsed = parseExpression();
  /* must have consumed every character */
  if (parsed === null || pos !== n) return null;
  return parsed;
}

const EMMET_PATTERN = /^[a-zA-Z]?[a-zA-Z0-9#.[\]=\-*+>]+$/;

function defineDarkTheme() {
  monaco.editor.defineTheme('opencode-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'constant', foreground: '4FC1FF' },
      { token: 'delimiter', foreground: '808080' },
      { token: 'tag', foreground: '569CD6' },
      { token: 'attribute', foreground: '9CDCFE' },
      { token: 'metatag', foreground: '569CD6' },
      { token: 'operator', foreground: 'D4D4D4' },
      { token: 'regexp', foreground: 'D16969' },
    ],
    colors: {
      'editor.background': '#0d0d0d',
      'editor.foreground': '#e4e4e7',
      'editor.lineHighlightBackground': '#141414',
      'editor.selectionBackground': 'rgba(129,140,248,0.2)',
      'editor.inactiveSelectionBackground': 'rgba(129,140,248,0.1)',
      'editorCursor.foreground': '#818cf8',
      'editorLineNumber.foreground': '#52525b',
      'editorLineNumber.activeForeground': '#a1a1aa',
      'editor.selectionHighlightBackground': 'rgba(129,140,248,0.15)',
      'editor.findMatchBackground': 'rgba(245,158,11,0.3)',
      'editor.findMatchHighlightBackground': 'rgba(245,158,11,0.15)',
      'editorBracketMatch.background': 'rgba(129,140,248,0.15)',
      'editorBracketMatch.border': 'rgba(129,140,248,0.4)',
      'editorGutter.background': '#0d0d0d',
      'editorWidget.background': '#141414',
      'editorWidget.border': '#262626',
      'input.background': '#1a1a1a',
      'input.border': '#333333',
      'focusBorder': '#818cf8',
      'list.activeSelectionBackground': 'rgba(129,140,248,0.2)',
      'list.hoverBackground': 'rgba(129,140,248,0.1)',
      'minimap.background': '#0a0a0a',
    },
  });
}

function defineLightTheme() {
  monaco.editor.defineTheme('opencode-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '7B4FFF' },
      { token: 'string', foreground: 'A31515' },
      { token: 'number', foreground: '098658' },
      { token: 'type', foreground: '267F99' },
      { token: 'function', foreground: '795E26' },
      { token: 'variable', foreground: '001080' },
      { token: 'constant', foreground: '0070C1' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#0a0a0a',
      'editor.lineHighlightBackground': '#f5f5f5',
      'editor.selectionBackground': 'rgba(91,91,245,0.2)',
      'editorCursor.foreground': '#5b5bf5',
      'editorGutter.background': '#fafafa',
    },
  });
}

function registerCompletionProviders() {
  /* ─── JavaScript / TypeScript snippets ─── */
  const jsTsSnippets = [
    {
      label: 'clg',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'console.log(${1:value});$0',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'console.log()',
      sortText: 'a',
    },
    {
      label: 'clge',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'console.error(${1:value});$0',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'console.error()',
      sortText: 'a',
    },
    {
      label: 'afn',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '(${1:params}) => {\n\t${0}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'Arrow function',
      sortText: 'a',
    },
    {
      label: 'nfn',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'function ${1:name}(${2:params}) {\n\t${0}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'Named function',
      sortText: 'a',
    },
    {
      label: 'imp',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'import ${1:default} from "${2:module}";$0',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'Import statement',
      sortText: 'a',
    },
    {
      label: 'exp',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'export ${1|default ,|}${2:name};$0',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'Export statement',
      sortText: 'a',
    },
    {
      label: 'tryc',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'try {\n\t${1}\n} catch (${2:err}) {\n\t${0}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'Try/catch block',
      sortText: 'a',
    },
    {
      label: 'fori',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:arr}.length; ${1:i}++) {\n\t${0}\n}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'For loop (indexed)',
      sortText: 'a',
    },
    {
      label: 'foreach',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '${1:arr}.forEach((${2:item}) => {\n\t${0}\n});',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'Array.forEach',
      sortText: 'a',
    },
    {
      label: 'map',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: '${1:arr}.map((${2:item}) => {\n\t${0}\n});',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'Array.map',
      sortText: 'a',
    },
  ];

  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: () => ({ suggestions: jsTsSnippets }),
  });
  monaco.languages.registerCompletionItemProvider('typescript', {
    provideCompletionItems: () => ({ suggestions: jsTsSnippets }),
  });

  /* ─── Python snippets ─── */
  monaco.languages.registerCompletionItemProvider('python', {
    provideCompletionItems: () => {
      return {
        suggestions: [
          {
            label: 'def',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'def ${1:name}(${2:params}):\n\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Define a function',
          },
          {
            label: 'class',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'class ${1:Name}:\n\t${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Define a class',
          },
          {
            label: 'import',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'import ${1:module}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Import a module',
          },
          {
            label: 'from',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'from ${1:module} import ${2:name}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Import from module',
          },
          {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'if ${1:condition}:\n\t${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'If statement',
          },
          {
            label: 'for',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'for ${1:item} in ${2:iterable}:\n\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'For loop',
          },
          {
            label: 'ifmain',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'if __name__ == "__main__":\n\t${1:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Main guard',
          },
          {
            label: 'while',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'while ${1:condition}:\n\t${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'While loop',
          },
          {
            label: 'try',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Try/except block',
          },
          {
            label: 'print',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'print(${1:value})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Print to stdout',
          },
          {
            label: 'len',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'len(${1:obj})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Get length of object',
          },
          {
            label: 'range',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'range(${1:start}, ${2:stop})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Generate a range of numbers',
          },
          {
            label: 'return',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'return ${1:value}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Return from function',
          },
        ],
      };
    },
  });

  /* ─── HTML snippets + Emmet expansion ─── */
  monaco.languages.registerCompletionItemProvider('html', {
    provideCompletionItems: (model, position) => {
      const suggestions: monaco.languages.CompletionItem[] = [
        {
          label: '!',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8" />\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n\t<title>${1:Document}</title>\n</head>\n<body>\n\t${0}\n</body>\n</html>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'HTML5 boilerplate',
          sortText: '!',
        },
        {
          label: 'div',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<div>\n\t$0\n</div>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Div container',
        },
        {
          label: 'span',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<span>$0</span>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Inline container',
        },
        {
          label: 'p',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<p>$0</p>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Paragraph',
        },
        {
          label: 'a',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<a href="${1:#}">$0</a>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Anchor link',
        },
        {
          label: 'img',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<img src="${1:url}" alt="${2:description}" />',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Image',
        },
        {
          label: 'ul',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<ul>\n\t<li>$0</li>\n</ul>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Unordered list',
        },
        {
          label: 'ol',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<ol>\n\t<li>$0</li>\n</ol>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Ordered list',
        },
        {
          label: 'table',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<table>\n\t<thead>\n\t\t<tr>\n\t\t\t<th>${1:Header}</th>\n\t\t</tr>\n\t</thead>\n\t<tbody>\n\t\t<tr>\n\t\t\t<td>$0</td>\n\t\t</tr>\n\t</tbody>\n</table>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Table',
        },
        {
          label: 'form',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<form action="${1:/submit}" method="${2:post}">\n\t$0\n</form>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Form',
        },
        {
          label: 'input',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<input type="${1:text}" placeholder="${2:}" />',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Input field',
        },
        {
          label: 'button',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<button type="${1:button}">$0</button>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Button',
        },
        {
          label: 'script',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<script>\n\t${1:// code}\n</script>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Script tag',
        },
        {
          label: 'link',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<link rel="${1:stylesheet}" href="${2:style.css}" />',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Link tag',
        },
        {
          label: 'meta',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '<meta charset="${1:UTF-8}" />',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Meta tag',
        },
      ];

      /* Emmet-like expansion */
      const lineContent = model.getLineContent(position.lineNumber);
      const textBeforeCursor = lineContent.slice(0, position.column - 1);
      const m = textBeforeCursor.match(/(\S+)$/);
      if (m) {
        const abbr = m[1];
        if (abbr.length > 0 && EMMET_PATTERN.test(abbr) && /[#.>[\]*+]/.test(abbr)) {
          const expanded = parseEmmet(abbr);
          if (expanded) {
            const startColumn = position.column - abbr.length;
            suggestions.unshift({
              label: `${abbr}  →`,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: expanded,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: 'Emmet expansion',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn,
                endColumn: position.column,
              },
              sortText: '!',
            });
          }
        }
      }

      return { suggestions };
    },
  });

  monaco.languages.registerCompletionItemProvider('css', {
    provideCompletionItems: () => {
      return {
        suggestions: [
          {
            label: 'flex',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'display: flex;',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Display flex',
          },
          {
            label: 'grid',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'display: grid;',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Display grid',
          },
          {
            label: 'center',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'display: flex;\njustify-content: center;\nalign-items: center;',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Flex center alignment',
          },
          {
            label: 'display',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'display: ${1|block,inline,flex,grid,none|};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Display property',
          },
          {
            label: 'color',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'color: ${1:#000};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Text color',
          },
          {
            label: 'background',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'background: ${1:#fff};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Background shorthand',
          },
          {
            label: 'margin',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'margin: ${1:0};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Margin shorthand',
          },
          {
            label: 'padding',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'padding: ${1:0};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Padding shorthand',
          },
          {
            label: 'font-size',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'font-size: ${1:16px};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Font size',
          },
          {
            label: 'font-weight',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'font-weight: ${1|normal,bold,100,200,300,400,500,600,700,800,900|};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Font weight',
          },
          {
            label: 'border',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'border: ${1:1px solid #ccc};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Border shorthand',
          },
          {
            label: 'width',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'width: ${1:100%};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Width property',
          },
          {
            label: 'height',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'height: ${1:100%};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Height property',
          },
          {
            label: 'position',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'position: ${1|relative,absolute,fixed,sticky,static|};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Position property',
          },
          {
            label: 'flex-direction',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'flex-direction: ${1|row,column,row-reverse,column-reverse|};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Flex direction',
          },
        ],
      };
    },
  });

  monaco.languages.registerCompletionItemProvider('json', {
    provideCompletionItems: () => {
      return {
        suggestions: [
          {
            label: 'string',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: '"${1:key}": "${2:value}"',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'String key-value pair',
          },
          {
            label: 'number',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: '"${1:key}": ${2:0}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Number key-value pair',
          },
          {
            label: 'object',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: '"${1:key}": {\n\t$0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Nested object',
          },
          {
            label: 'array',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: '"${1:key}": [\n\t$0\n]',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Array value',
          },
          {
            label: 'boolean',
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: '"${1:key}": ${2|true,false|}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Boolean key-value pair',
          },
        ],
      };
    },
  });
}

export function initMonaco(): void {
  if (initialized) return;
  initialized = true;

  const savedGW = (window as any).MonacoEnvironment?.getWorker;
  if (savedGW) {
    (window as any).MonacoEnvironment = { getWorker: savedGW };
  }

  defineDarkTheme();
  defineLightTheme();

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2022,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    allowNonTsExtensions: true,
    strict: true,
  });

  const libSource = [
    'declare function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;',
    'declare var console: { log(...data: any[]): void; error(...data: any[]): void; warn(...data: any[]): void; };',
    'declare var process: { env: Record<string, string>; exit(code?: number): void; };',
    'declare var require: (id: string) => any;',
    'declare var module: { exports: any; };',
  ].join('\n');

  monaco.languages.typescript.typescriptDefaults.addExtraLib(libSource, 'global.d.ts');
  monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, 'global.d.ts');

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
    diagnosticCodesToIgnore: [],
  });
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
    diagnosticCodesToIgnore: [],
  });

  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(false);
  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(false);

  registerCompletionProviders();
}

export function createEditor(
  container: HTMLElement,
  options: {
    value?: string;
    language?: string;
    theme?: 'dark' | 'light';
    fontSize?: number;
    fontFamily?: string;
    tabSize?: number;
    wordWrap?: string;
    minimap?: boolean;
    readOnly?: boolean;
  } = {}
): monaco.editor.IStandaloneCodeEditor {
  initMonaco();
  const isDark = options.theme !== 'light';

  const editor = monaco.editor.create(container, {
    value: options.value || '',
    language: options.language || 'plaintext',
    theme: isDark ? 'opencode-dark' : 'opencode-light',
    fontSize: options.fontSize || 14,
    fontFamily: options.fontFamily || "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    tabSize: options.tabSize || 2,
    wordWrap: (options.wordWrap as any) || 'off',
    minimap: { enabled: options.minimap !== false },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    renderWhitespace: 'selection',
    bracketPairColorization: { enabled: true },
    autoIndent: 'full',
    formatOnPaste: true,
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    readOnly: options.readOnly || false,
    padding: { top: 8 },
    guides: { indentation: true, bracketPairs: true },
    suggest: {
      showWords: true,
      showSnippets: true,
      showClasses: true,
      showFunctions: true,
      showVariables: true,
      showModules: true,
    },
    quickSuggestions: { other: true, comments: false, strings: false },
    wordBasedSuggestions: 'currentDocument',
    parameterHints: { enabled: true },
    hover: { enabled: true, delay: 300 },
    renderLineHighlight: 'all',
    folding: true,
    foldingStrategy: 'auto',
    matchBrackets: 'always',
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoClosingOvertype: 'always',
    autoSurround: 'languageDefined',
    links: true,
    colorDecorators: true,
    lightbulb: { enabled: true },
    fixedOverflowWidgets: true,
    overviewRulerBorder: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
  });

  return editor;
}

export function updateEditorTheme(editor: monaco.editor.IStandaloneCodeEditor, theme: 'dark' | 'light') {
  monaco.editor.setTheme(theme === 'dark' ? 'opencode-dark' : 'opencode-light');
}

export function focusEditor(editor: monaco.editor.IStandaloneCodeEditor): void {
  editor.focus();
}
