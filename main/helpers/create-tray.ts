import { nativeImage, Tray } from "electron";

export const createTray = () => {
  const icon = nativeImage.createFromPath('resources/tray-icon.png');
  const trayIcon = icon.resize({ width: 18 });
  trayIcon.setTemplateImage(true);

  const tray = new Tray(trayIcon);

  return tray;
};
