import path from 'path';
import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createTray, createWindow } from './helpers';
import { LocalStorage } from './utils/local-storage';

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
  const mainWindow = createWindow('main', {
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

  const getWindowPosition = () => {
    const windowBounds = mainWindow.getBounds();
    const trayBounds = tray.getBounds();
  
    // Center window horizontally below the tray icon
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
  
    // Position window 4 pixels vertically below the tray icon
    const y = Math.round(trayBounds.y + trayBounds.height + 4);
  
    return { x: x, y: y };
  };

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
    }
  });

  const showWindow = () => {
    const position = getWindowPosition();
    mainWindow.setPosition(position.x, position.y, false);
    mainWindow.show();
    mainWindow.focus();
  };

  const toggleWindow = () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      showWindow();
    }
  };

  tray.on('double-click', toggleWindow);
  tray.on('click', (event) => {
    toggleWindow();

    // Show devtools when command clicked
    if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
  }

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
})();

app.on('window-all-closed', () => {
  app.quit();
});
