import { ipcMain, app } from "electron";
import Store from "electron-store";
import { version } from "../../package.json";

export const store = new Store();

store.set("version", version);
const defaultSetting = {
  useCliCredentials: "N",
};
const appSetting = store.get("setting", {});

if (!appSetting.download_path) {
  appSetting.download_path = app.getPath("downloads");
  store.set("setting", appSetting);
}
if (!appSetting.useCliCredentials) {
  appSetting.useCliCredentials = defaultSetting.useCliCredentials;
  store.set("setting", appSetting);
}

export default () => {
  ipcMain.handle("get", (e, [k]) => store.get(k));
  ipcMain.handle("set", (e, [k, v]) => store.set(k, v));
  ipcMain.handle("delete", (e, [k]) => store.delete(k));
};
