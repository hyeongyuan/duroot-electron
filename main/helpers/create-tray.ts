import path from 'path';
import { nativeImage, Tray } from 'electron';

const isProd = process.env.NODE_ENV === 'production';

const getResourcesPath = (pathname: string) => {
  return path.join(isProd ? process.resourcesPath : process.cwd(), pathname);
};

const getTrayIcon = () => {
  const icon = nativeImage.createFromPath(getResourcesPath('assets/tray-icon.png'));
  const trayIcon = icon.resize({ width: 18 });

  trayIcon.setTemplateImage(true);

  return trayIcon;
};

export const createTray = () => {
  const trayIcon = getTrayIcon();

  const tray = new Tray(trayIcon);

  return tray;
};
