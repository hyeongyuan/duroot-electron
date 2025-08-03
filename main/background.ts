import path from 'node:path';
import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createTray } from './helpers';
import { LocalStorage } from './utils/local-storage';
import { TrayWindow } from './utils/tray-window';
import { AppUpdater } from './utils/app-updater';

const isProd = process.env.NODE_ENV === 'production';
const isMac = process.platform === 'darwin';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

;(async () => {
  await app.whenReady();

  const tray = createTray();;

  if (isMac) {
    app.dock.hide();
  }
  const appUpdater = new AppUpdater();
  const window = new TrayWindow(tray, 'main', {
    width: 400,
    height: 500,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(process.cwd(), 'resources/icon.ico'),
  });

  tray.on('double-click', window.toggle);
  tray.on('click', (event) => {
    window.toggle();

    // Show devtools when command clicked
    if (window.isVisible && process.defaultApp && event.metaKey) {
      window.openDevTool({ mode: 'detach' });
    }
  });

  await window.loadRoute('/home');

  const storage = new LocalStorage('v1');
  ipcMain.handle('storage:get', (_event, key) => {
    return storage.get(key);
  });
  ipcMain.handle('storage:set', (_event, key, value) => {
    return storage.set(key, value);
  });
  ipcMain.handle('storage:delete', (_event, key) => {
    return storage.delete(key);
  });

  ipcMain.handle('version', () => app.getVersion());
  ipcMain.handle('quit', () => app.quit());

  ipcMain.handle('set-tray-icon', (_event, iconName) => {
    window.setTrayIcon(iconName);
  });

  appUpdater.checkForUpdatesAndNotify();
})();

app.on('window-all-closed', () => {
  app.quit();
});
