import { BrowserWindow, BrowserWindowConstructorOptions, OpenDevToolsOptions, Rectangle, Tray } from "electron";
import Store from 'electron-store';

type WindowPosition = Pick<Rectangle, 'x' | 'y'>;
type WindowSize = Pick<Rectangle, 'width' | 'height'>;
type WindowState = WindowPosition & WindowSize;

const isProd = process.env.NODE_ENV === 'production';
const storeKey = 'window-state';

export class TrayWindow {
  private _window: BrowserWindow;
  private _windowState: WindowState;

  constructor(
    protected readonly _tray: Tray,
    protected readonly _name: string,
    options: BrowserWindowConstructorOptions,
  ) {
    const storeName = `window-state-${this._name}`;
    const store = new Store<Rectangle>({ name: storeName });

    const defaultSize: WindowSize = {
      width: options.width,
      height: options.height,
    };
    const defaultPosition = this._getWindowPosition(defaultSize);

    this._windowState = store.get(storeKey, {
      ...defaultSize,
      ...defaultPosition,
    });

    this._window = new BrowserWindow({
      ...this._windowState,
      ...options,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        ...options.webPreferences,
      },
    });

    this._window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    this._window.on('blur', () => {
      if (!this._window.webContents.isDevToolsOpened()) {
        this.hide();
      }
    });

    this._window.on('close', () => {
      if (!this._window.isMinimized() && !this._window.isMaximized()) {
        Object.assign(this._windowState, this._getCurrentWindowState());
      }
      store.set(storeKey, this._windowState);
    }); 
  }

  get name() {
    return this._name;
  }

  get isVisible() {
    return this._window.isVisible();
  }

  loadRoute = async (route: string) => {
    if (isProd) {
      await this._window.loadURL(`app://.${route}`);
    } else {
      const port = process.argv[2];
      await this._window.loadURL(`http://localhost:${port}${route}`);
    }
  };
  
  toggle = () => {
    if (this._window.isVisible()) {
      this._window.hide();
    } else {
      this.show();
    }
  };

  show = () => {
    const { width, height } = this._window.getBounds();
    const { x, y } = this._getWindowPosition({ width, height });

    this._window.setPosition(x, y);
    this._window.show();
    this._window.focus();
  };

  hide = () => {
    this._window.hide();
  };

  openDevTool = (options?: OpenDevToolsOptions) => {
    this._window.webContents.openDevTools(options);
  };

  private _getWindowPosition = (windowSize: WindowSize) => {
    const trayBounds = this._tray.getBounds();
    return Object.assign({}, windowSize, {
      x: Math.round(trayBounds.x + (trayBounds.width / 2) - (windowSize.width / 2)),
      y: Math.round(trayBounds.y + trayBounds.height + 4),
    });
  };

  private _getCurrentWindowState = () => {
    const position = this._window.getPosition();
    const size = this._window.getSize();
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    };
  };
}
