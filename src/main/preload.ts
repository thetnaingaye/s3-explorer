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
      getObjectPresignedUrl: (args: unknown[]) =>
        ipcRenderer.invoke("aws:s3:getObjectPresignedUrl", args),
      listBuckets: (args: unknown[]) =>
        ipcRenderer.invoke("aws:s3:listBuckets", args),
      getBucketRegion: (args: unknown[]) =>
        ipcRenderer.invoke("aws:s3:getBucketRegion", args),
      uploadFiles: (args: unknown[]) =>
        ipcRenderer.invoke("aws:s3:uploadFiles", args),
      deleteObject: (args: unknown[]) =>
        ipcRenderer.invoke("aws:s3:deleteObject", args),
      deleteFolder: (args: unknown[]) =>
        ipcRenderer.invoke("aws:s3:deleteFolder", args),
      putObject: (args: unknown[]) =>
        ipcRenderer.invoke("aws:s3:putObject", args),
      downloadObject: (args: unknown[]) =>
        ipcRenderer.invoke("aws:s3:downloadObject", args),
    },
    profile: {
      list: (args: unknown[]) => ipcRenderer.invoke("aws:profile:list", args),
      add: (args: unknown[]) => ipcRenderer.invoke("aws:profile:add", args),
      get: (args: unknown[]) => ipcRenderer.invoke("aws:profile:get", args),
      update: (args: unknown[]) =>
        ipcRenderer.invoke("aws:profile:update", args),
      delete: (args: unknown[]) =>
        ipcRenderer.invoke("aws:profile:delete", args),
    },
  },
  electronStore: {
    get: (args: unknown[]) => ipcRenderer.invoke("get", args),
    set: (args: unknown[]) => ipcRenderer.invoke("set", args),
    delete: (args: unknown[]) => ipcRenderer.invoke("delete", args),
  },
  setting: {
    setDownloadPath: (args: unknown[]) =>
      ipcRenderer.invoke("setting:setDownloadPath", args),
  },
};

contextBridge.exposeInMainWorld("electron", electronHandler);

export type ElectronHandler = typeof electronHandler;
