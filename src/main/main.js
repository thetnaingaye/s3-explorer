/* eslint global-require: off, no-console: off, promise/always-return: off,no-await-in-loop: "off" */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from "path";
import { app, BrowserWindow, shell, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
// import ChildProcess from 'child_process';
import log from "electron-log";
import AWS from "aws-sdk";
import {
  GetObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import MenuBuilder from "./menu";
import { resolveHtmlPath } from "./util";

AWS.config.getCredentials((err) => {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("Access key:", AWS.config?.credentials?.accessKeyId);
  }
});

const s3 = new S3Client({});
class AppUpdater {
  constructor() {
    log.transports.file.level = "info";
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;
ipcMain.on("ipc-s3", async (event, arg) => {
  console.log("arg == ", arg);
  const [action, payload] = arg;
  let command;
  let presignedUrl;
  switch (action) {
    case "list_objects":
      command = new ListObjectsV2Command({
        Bucket: payload,
        Delimiter: "/",
      });
      try {
        let isTruncated = true;

        let contents = [];
        let prefixes = [];

        while (isTruncated) {
          const {
            Contents,
            IsTruncated,
            NextContinuationToken,
            CommonPrefixes,
          } = await s3.send(command);
          contents = contents.concat(Contents);
          prefixes = prefixes.concat(CommonPrefixes);
          isTruncated = IsTruncated;
          command.input.ContinuationToken = NextContinuationToken;
        }
        // console.log(contents);
        // console.log("Common Prefixes", prefixes);
        event.reply("ipc-s3", {
          contents,
          prefixes,
        });
      } catch (err) {
        console.error(err);
      }
      break;
    case "get_object":
      command = new GetObjectCommand({
        Bucket: payload.Bucket,
        Key: payload.Key,
      });
      presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      mainWindow.webContents.downloadURL(presignedUrl);
      break;
    default:
      break;
  }
});

ipcMain.on("ipc-example", async (event, arg) => {
  const msgTemplate = (pingPong) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  const command = new ListBucketsCommand({});

  try {
    const { Buckets } = await s3.send(command);
    // console.log(
    //   `${Owner?.DisplayName} owns ${Buckets?.length} bucket${
    //     Buckets?.length === 1 ? "" : "s"
    //   }:`
    // );
    // console.log(`${Buckets?.map((b) => ` • ${b.Name}`).join("\n")}`);
    event.reply("ipc-example", Buckets);
  } catch (err) {
    console.error(err);
  }
  // const s3 = new AWS.S3({
  //   accessKeyId: AWS.config?.credentials?.accessKeyId,
  //   secretAccessKey: AWS.config?.credentials?.secretAccessKey,
  // });
  // s3.listBuckets((err, data) => {
  //   if (err) {
  //     console.log("Error", err);
  //   } else {
  //     console.log("Success", data.Buckets);
  //     event.reply("ipc-example", data.Buckets);
  //   }
  // });
  // const cmd = ChildProcess.spawnSync('aws', ['s3', 'ls'], {
  //   encoding: 'utf-8',
  // });
  // console.log('data === ', cmd.stdout);
  // event.reply('ipc-example', cmd.stdout);
  // event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true";

if (isDebug) {
  require("electron-debug")();
}

const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS"];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(__dirname, "../../assets");

  const getAssetPath = (...paths) => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath("icon.png"),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, "preload.js")
        : path.join(__dirname, "../../.erb/dll/preload.js"),
    },
  });

  mainWindow.loadURL(resolveHtmlPath("index.html"));

  mainWindow.on("ready-to-show", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: "deny" };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on("activate", () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
