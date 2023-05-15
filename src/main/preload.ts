// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

export type Channels = "ipc-s3";

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  aws: {
    s3: {
      listObjects: (args: unknown[]) =>
        ipcRenderer.invoke("aws:s3:listObjects", args),
      getObject: (args: unknown[]) =>
        ipcRenderer.invoke("aws:s3:getObject", args),
      listBuckets: (args: unknown[]) =>
        ipcRenderer.invoke("aws:s3:listBuckets", args),
    },
    profile: {
      list: (args: unknown[]) => ipcRenderer.invoke("aws:profile:list", args),
    },
  },
};

contextBridge.exposeInMainWorld("electron", electronHandler);

export type ElectronHandler = typeof electronHandler;
