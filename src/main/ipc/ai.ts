import { ipcMain, BrowserWindow } from 'electron';
import * as https from 'https';
import * as http from 'http';

function parseEndpoint(endpoint: string): { protocol: any; hostname: string; port: number; path: string } {
  const url = new URL(endpoint);
  return {
    protocol: url.protocol === 'https:' ? https : http,
    hostname: url.hostname,
    port: url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
  };
}

export function setupAIIPC(): void {
  ipcMain.handle('ai:chat', async (_event, messages: any[], apiKey: string, model: string, endpoint: string) => {
    const { protocol, hostname, port, path } = parseEndpoint(endpoint);

    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        model,
        messages,
        stream: false,
      });

      const req = protocol.request({
        hostname,
        port,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(payload),
        },
      }, (res: any) => {
        let data = '';
        res.on('data', (chunk: string) => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.choices?.[0]?.message?.content || json.message || json.content || data);
          } catch {
            resolve(data);
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  });

  ipcMain.on('ai:chatStream', (event, messages: any[], apiKey: string, model: string, endpoint: string, channel: string) => {
    const { protocol, hostname, port, path } = parseEndpoint(endpoint);
    const win = BrowserWindow.fromWebContents(event.sender);

    const payload = JSON.stringify({
      model,
      messages,
      stream: true,
    });

    const req = protocol.request({
      hostname,
      port,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res: any) => {
      let buffer = '';
      res.on('data', (chunk: string) => {
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            if (win && !win.isDestroyed()) win.webContents.send(`${channel}:end`);
            return;
          }
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content || '';
            if (content && win && !win.isDestroyed()) {
              win.webContents.send(channel, content);
            }
          } catch {}
        }
      });

      res.on('end', () => {
        if (win && !win.isDestroyed()) win.webContents.send(`${channel}:end`);
      });
    });

    req.on('error', (err: Error) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send(channel, `\n\nError: ${err.message}`);
        win.webContents.send(`${channel}:end`);
      }
    });

    req.write(payload);
    req.end();
  });
}
