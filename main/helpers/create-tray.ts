import path from 'path';
import { nativeImage, Tray } from 'electron';

const isProd = process.env.NODE_ENV === 'production';

const getResourcesPath = (pathname: string) => {
  return path.join(isProd ? process.resourcesPath : process.cwd(), pathname);
};

export const getTrayIcon = (filename: string) => {
  const icon = nativeImage.createFromPath(getResourcesPath(`assets/${filename}`));
  const trayIcon = icon.resize({ width: 18 });

  trayIcon.setTemplateImage(true);

  return trayIcon;
};

export const createTray = () => {
  const trayIcon = getTrayIcon('tray-icon.png');

  const tray = new Tray(trayIcon);

  return tray;
};
