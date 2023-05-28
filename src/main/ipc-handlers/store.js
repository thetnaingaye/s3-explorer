import { ipcMain } from "electron";
import Store from "electron-store";
import { version } from "../../../package.json";

export const store = new Store();
store.set("app_version", version);

export default () => {
  ipcMain.handle("get", (e, [k]) => store.get(k));
  ipcMain.handle("set", (e, [k, v]) => store.set(k, v));
  ipcMain.handle("delete", (e, [k]) => store.delete(k));
};
