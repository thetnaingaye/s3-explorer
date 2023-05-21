import { ipcMain, app } from "electron";
import Store from "electron-store";

export const store = new Store();

store.set("version", "0.1.0");
store.set("download_path", app.getPath("downloads"));

export default () => {
  ipcMain.handle("get", (e, [k]) => store.get(k));
  ipcMain.handle("set", (e, [k, v]) => store.set(k, v));
  ipcMain.handle("delete", (e, [k]) => store.delete(k));
};
