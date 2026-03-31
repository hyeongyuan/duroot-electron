import { dialog } from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";

export class AppUpdater {
	private _log = log;

	constructor() {
		autoUpdater.on("checking-for-update", () => {
			this._log.info("Checking for update...");
		});
		autoUpdater.on("update-available", (info) => {
			this._log.info("Update available.");

			dialog
				.showMessageBox({
					type: "info",
					detail: `Version ${info.version} is available.\nDo you want to update now?`,
					checkboxLabel: "Do not ask again",
					message: "Update Available",
					buttons: ["Cancel", "Update"],
					cancelId: 0,
					defaultId: 1,
				})
				.then(({ response, checkboxChecked }) => {
					if (response === 1) {
						autoUpdater.downloadUpdate();
					}
				});
		});
		autoUpdater.on("update-not-available", (info) => {
			this._log.info("Update not available.");
		});
		autoUpdater.on("error", (error) => {
			this._log.info(`Error in auto-updater. ${error}`);

			dialog.showErrorBox(
				"Error: ",
				error == null ? "unknown" : (error.stack || error).toString(),
			);
		});
		autoUpdater.on("download-progress", (progressObj) => {
			let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
			log_message = `${log_message} - Downloaded ${progressObj.percent}%`;
			log_message = `${log_message} (${progressObj.transferred}/${progressObj.total})`;

			this._log.info(log_message);
		});
		autoUpdater.on("update-downloaded", (info) => {
			this._log.info("Update downloaded");

			dialog
				.showMessageBox({
					message: "Install Updates",
					detail: "Updates downloaded, application will be quit for update...",
				})
				.then(() => {
					setImmediate(() => autoUpdater.quitAndInstall());
				});
		});

		autoUpdater.autoDownload = false;
	}

	checkForUpdatesAndNotify() {
		return autoUpdater.checkForUpdatesAndNotify();
	}

	checkForUpdates() {
		return autoUpdater.checkForUpdates();
	}
}
