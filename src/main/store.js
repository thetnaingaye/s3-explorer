import { ipcMain } from "electron";
import Store from "electron-store";

const store = new Store();

store.set("version", "0.1.0");

export default () => {
  ipcMain.handle("get", (e, [k]) => store.get(k));
  ipcMain.handle("set", (e, [k, v]) => store.set(k, v));
  ipcMain.handle("delete", (e, [k]) => store.delete(k));
};
