function badge(color: string, text: string, bg?: string): string {
  const bgFill = bg || color;
  return `<svg viewBox="0 0 32 32" width="16" height="16"><rect x="1" y="1" width="30" height="30" rx="5" fill="${bgFill}" opacity="0.15"/><rect x="1" y="1" width="30" height="30" rx="5" fill="none" stroke="${color}" stroke-width="1.5"/><text x="16" y="22" text-anchor="middle" fill="${color}" font-size="13" font-weight="700" font-family="Inter,sans-serif">${text}</text></svg>`;
}

const ICONS: Record<string, string> = {
  ts: badge('#3178C6', 'TS'),
  tsx: badge('#61DAFB', 'RX', '#0288D1'),
  js: badge('#F7DF1E', 'JS'),
  jsx: badge('#61DAFB', 'JS', '#0288D1'),
  mjs: badge('#F7DF1E', 'JS'),
  cjs: badge('#F7DF1E', 'JS'),
  json: badge('#F5A623', '{}'),
  jsonc: badge('#F5A623', '{}'),
  html: badge('#E34F26', '</>'),
  htm: badge('#E34F26', '</>'),
  css: badge('#1572B6', '#'),
  scss: badge('#CC6699', '#'),
  less: badge('#1D365D', '#'),
  sass: badge('#CC6699', '#'),
  styl: badge('#B3D107', 'St'),
  md: badge('#083FA1', 'M↓'),
  mdx: badge('#083FA1', 'MX'),
  py: badge('#3776AB', 'Py'),
  pyw: badge('#3776AB', 'Py'),
  java: badge('#ED8B00', 'Jv'),
  c: badge('#555555', 'C'),
  h: badge('#555555', 'H'),
  cpp: badge('#00599C', 'C++'),
  cxx: badge('#00599C', 'C++'),
  cc: badge('#00599C', 'C++'),
  hpp: badge('#00599C', 'H++'),
  cs: badge('#512BD4', 'C#'),
  go: badge('#00ADD8', 'Go'),
  rs: badge('#DEA584', 'Rs'),
  rb: badge('#CC342D', 'Rb'),
  php: badge('#777BB4', 'Ph'),
  swift: badge('#F05138', 'Sw'),
  kt: badge('#7F52FF', 'Kt'),
  kts: badge('#7F52FF', 'Kt'),
  scala: badge('#DC322F', 'Sc'),
  dart: badge('#0175C2', 'Dr'),
  lua: badge('#000080', 'Lu'),
  r: badge('#276DC3', 'R'),
  pl: badge('#39457E', 'Pl'),
  pm: badge('#39457E', 'Pl'),
  sh: badge('#4EAA25', '>_'),
  bash: badge('#4EAA25', '>_'),
  zsh: badge('#4EAA25', '>_'),
  fish: badge('#4EAA25', '>_'),
  ps1: badge('#012456', 'PS'),
  psm1: badge('#012456', 'PS'),
  bat: badge('#4EAA25', 'BT'),
  cmd: badge('#4EAA25', 'BT'),
  sql: badge('#E38C00', 'DB'),
  xml: badge('#005FAD', '</>'),
  svg: badge('#FFB13B', 'SV'),
  yaml: badge('#CB171E', 'Y'),
  yml: badge('#CB171E', 'Y'),
  toml: badge('#9C4221', 'T'),
  ini: badge('#6B7280', 'CF'),
  cfg: badge('#6B7280', 'CF'),
  env: badge('#ECD53F', 'EN'),
  dockerfile: badge('#2496ED', 'DK'),
  graphql: badge('#E10098', 'GQ'),
  gql: badge('#E10098', 'GQ'),
  vue: badge('#42B883', 'Vu'),
  svelte: badge('#FF3E00', 'Sv'),
  prisma: badge('#2D3748', 'Pr'),
  pug: badge('#A86454', 'Pg'),
  jade: badge('#A86454', 'Jd'),
  coffee: badge('#6F4E37', 'Cf'),
  hs: badge('#5E5086', 'Hs'),
  elm: badge('#60B5CC', 'El'),
  clj: badge('#5881D8', 'Cj'),
  cljs: badge('#5881D8', 'Cj'),
  ex: badge('#4B275F', 'Ex'),
  exs: badge('#4B275F', 'Ex'),
  erl: badge('#A2003E', 'Er'),
  fs: badge('#378BBA', 'F#'),
  fsx: badge('#378BBA', 'F#'),
  vb: badge('#512BD4', 'VB'),
  tex: badge('#008080', 'Tx'),
  makefile: badge('#6D00C2', 'MK'),
  mk: badge('#6D00C2', 'MK'),
  cmake: badge('#6D00C2', 'CM'),
  lock: badge('#9CA3AF', '🔒'),
  gitignore: badge('#F05032', 'Gi'),
  editorconfig: badge('#F05032', 'EC'),
};

const EXT_TO_KEY: Record<string, string> = {};

for (const key of Object.keys(ICONS)) {
  EXT_TO_KEY['.' + key] = key;
}

export function getFileIcon(ext: string): string {
  const key = EXT_TO_KEY[ext];
  if (key && ICONS[key]) return ICONS[key];
  return badge('#6B7280', '?');
}

export function getFileIconByName(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot === -1) return getFileIcon('');
  return getFileIcon(filename.substring(dot));
}
