import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

export class AppUpdater {
  private _log = log;

  constructor() {
    autoUpdater.on('checking-for-update', () => {
      this._log.info('Checking for update...');
    });
    autoUpdater.on('update-available', (info) => {
      this._log.info('Update available.');
    });
    autoUpdater.on('update-not-available', (info) => {
      this._log.info('Update not available.');
    });
    autoUpdater.on('error', (err) => {
      this._log.info(`Error in auto-updater. ${err}`);
    });
    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
      log_message = `${log_message} - Downloaded ${progressObj.percent}%`;
      log_message = `${log_message} (${progressObj.transferred}/${progressObj.total})`;

      this._log.info(log_message);
    })
    autoUpdater.on('update-downloaded', (info) => {
      this._log.info('Update downloaded');
    });
  }

  checkForUpdatesAndNotify() {
    return autoUpdater.checkForUpdatesAndNotify();
  }

  checkForUpdates() {
    return autoUpdater.checkForUpdates();
  }
}
