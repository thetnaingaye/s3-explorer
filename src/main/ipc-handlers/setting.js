import { ipcMain, dialog, app } from "electron";
import { store } from "./store";

const defaultSetting = {
  useCliCredentials: "N",
  download_path: app.getPath("downloads"),
  download_open_folder_when_done: "Y",
};
const appSetting = store.get("setting", {});

// set default values
if (!appSetting.download_path) {
  appSetting.download_path = defaultSetting.download_path;
  store.set("setting", appSetting);
}

if (!appSetting.download_open_folder_when_done) {
  appSetting.download_open_folder_when_done =
    defaultSetting.download_open_folder_when_done;
  store.set("setting", appSetting);
}

if (!appSetting.useCliCredentials) {
  appSetting.useCliCredentials = defaultSetting.useCliCredentials;
  store.set("setting", appSetting);
}

const handleSetDownloadPath = () => {
  const path = dialog.showOpenDialogSync({
    properties: ["openDirectory"],
  });
  const setting = store.get("setting");
  if (path?.length) {
    setting.download_path = path[0];
    store.set("setting", setting);
  }
};

export default () => {
  ipcMain.handle("setting:setDownloadPath", handleSetDownloadPath);
};
