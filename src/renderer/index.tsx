import { render } from 'preact';
import { html } from './services/html';
import { App } from './components/App';
import './styles/global.css';

window.onerror = (_msg, _url, _line, _col, err) => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = '<div style="padding:40px;font-family:sans-serif;background:#fafafa;color:#ef4444;"><h2>Error</h2><pre style="font-size:12px;white-space:pre-wrap;">' +
      (err ? (String(err.stack || err.message)) : 'Unknown error') + '</pre></div>';
  }
};

const root = document.getElementById('app');
if (root) render(html`<${App} />`, root);
