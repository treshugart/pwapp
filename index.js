const { app, BrowserWindow, NativeImage, Tray } = require("electron");
const windowStateKeeper = require("electron-window-state");
const fetch = require("node-fetch");
const fs = require("fs-extra");
const gm = require("gm");
const meow = require("meow");
const path = require("path");

const faviconIco = path.join(__dirname, "favicon.ico");
const faviconPng = path.join(__dirname, "favicon.png");

async function getManifestJson(url) {
  const resp = await fetch(`${url}/manifest.json`);
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch (e) {}
  return {};
}

async function setIcon({ icons }) {
  if (!icons.length) {
    return;
  }
  const response = await fetch(icon);
  const file = fs.createWriteStream(faviconIco);
  response.body.pipe(file);
  file.on("close", () => {
    gm(faviconIco).write(faviconPng, async e => {
      if (e) console.error(e);
      app.dock.setIcon(faviconPng);
    });
  });
}

async function setName({ name }) {
  app.setName(name);
}

async function createWindow(url) {
  const manifestJson = {
    name: url,
    icons: [],
    ...(await getManifestJson(url))
  };

  await setIcon(manifestJson);
  await setName(manifestJson);

  const mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  });

  const win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      nodeIntegration: false
    }
  });

  mainWindowState.manage(win);
  win.loadURL(url);

  win.webContents.on("new-window", async (e, url) => {
    e.preventDefault();
    await createWindow(url);
  });
}

app.once("ready", () => {
  const url = process.argv[2];
  if (!url) throw "You must specify a URL.";
  createWindow(url);
});
