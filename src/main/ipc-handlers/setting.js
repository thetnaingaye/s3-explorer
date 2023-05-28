import { ipcMain, dialog } from "electron";
import { store } from "./store";

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
