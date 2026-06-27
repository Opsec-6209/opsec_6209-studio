import { ipcMain, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Settings, DEFAULT_SETTINGS } from '../../shared/types';

let settings: Settings = { ...DEFAULT_SETTINGS };
let settingsPath = '';

function getSettingsPath(): string {
  if (!settingsPath) {
    settingsPath = path.join(app.getPath('userData'), 'settings.json');
  }
  return settingsPath;
}

function loadFromDisk(): Settings {
  try {
    const sp = getSettingsPath();
    if (fs.existsSync(sp)) {
      const data = fs.readFileSync(sp, 'utf-8');
      const loaded = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...loaded };
    }
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveToDisk(s: Settings): void {
  const dir = path.dirname(getSettingsPath());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getSettingsPath(), JSON.stringify(s, null, 2), 'utf-8');
}

export function setupSettingsIPC(): void {
  settings = loadFromDisk();

  ipcMain.handle('settings:load', () => {
    return settings;
  });

  ipcMain.handle('settings:save', (_event, newSettings: Settings) => {
    settings = { ...settings, ...newSettings };
    saveToDisk(settings);
    return settings;
  });

  ipcMain.handle('settings:getAppPath', () => {
    return app.getPath('userData');
  });
}

export function getSettings(): Settings {
  return settings;
}
