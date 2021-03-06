import electron from 'electron';
import chokidar from 'chokidar';
import storage from 'electron-json-storage';
import fs from 'fs';
import path from 'path';

import PostManager from './post-manager.js'

const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
const shell = electron.shell;
const dialog = electron.dialog;
const ipcMain = electron.ipcMain;

const STATUS_FILE = path.join(app.getPath('userData'), './status.json');

const _postManager = new PostManager();
let _watcher = null;

app.on('ready', () => {
  let status;
  try {
    const content = fs.readFileSync(STATUS_FILE, 'utf8');
    status = content ? JSON.parse(content) : {};
  } catch (e) {
    status = {};
  }

  status.folder = path.resolve(path.join(__dirname, '../posts'));
  try {
    fs.accessSync(`${status.folder}/trash`);
  } catch (err) {
    fs.mkdirSync(`${status.folder}/trash`);
  }

  _postManager.start(status);

  if (process.platform === 'darwin') {
    _createMenu();
  } else {
    _createTrayMenu();
  }

  _watcher = chokidar.watch(_postManager.folder, {ignoreInitial: true});
  _watcher.on('add', _postManager.open.bind(_postManager));
});

app.on('before-quit', (event) => {
  const status = _postManager.stop();
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, '  '));
});

app.on('window-all-closed', () => {});

ipcMain.on('add-post', () => _postManager.add());

ipcMain.on('remove-post', (_e, fullPath) => {
  _postManager.remove(fullPath)
});

function _createMenu() {
  const menuTemplate = [
    {
      label: app.getName(),
      submenu: [
        { label: '付箋フォルダ指定...', click: ()=> {
          const options = {
            title: '付箋フォルダを選択してください。',
            properties: ['openDirectory']
          };
          const directories = dialog.showOpenDialog(options);
          if (directories && directories[0]) {
            _watcher.close();

            _postManager.changeFolder(directories[0]);
            _watcher = chokidar.watch(_postManager.folder, {ignoreInitial: true});
            _watcher.on('add', _postManager.open.bind(_postManager));
          }
        }},
        { label: '付箋フォルダを開く', click: ()=> {
          shell.openItem(_postManager.folder);
        }},
        { label: '終了', accelerator: 'Cmd+Q', click: app.quit }
      ]
    },
    {
      label: 'ファイル',
      submenu: [
        { label: '新しい付箋', accelerator: 'Cmd+N', click: _postManager.add.bind(_postManager) }
      ]
    },
    {
      label: "編集",
      submenu: [
        {
          label: "コピー",
          accelerator: "CmdOrCtrl+C",
          role: "copy"
        },
        {
          label: "ペースト",
          accelerator: "CmdOrCtrl+V",
          role: "paste"
        },
        {
          label: "カット",
          accelerator: "CmdOrCtrl+X",
          role: "cut"
        },
        {
          label: "すべて選択",
          accelerator: "CmdOrCtrl+A",
          role: "selectall",
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

function _createTrayMenu() {
  const menuTemplate = [
    { label: '新しい付箋', click: _postManager.add.bind(_postManager) },
    { label: '付箋フォルダ指定...', click: ()=> {
      const options = {
        title: '付箋フォルダを選択してください。',
        properties: ['openDirectory']
      };
      const directories = dialog.showOpenDialog(options);
      if (directories && directories[0]) {
        _watcher.close();

        _postManager.changeFolder(directories[0]);
        _watcher = chokidar.watch(_postManager.folder, {ignoreInitial: true});
        _watcher.on('add', _postManager.open.bind(_postManager));
      }
    }},
    { label: '付箋フォルダを開く', click: ()=> {
      shell.openItem(_postManager.folder);
    }},
    { label: '終了', click: app.quit }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  const trayIcon = new Tray(`${__dirname}/../icons/tag-32.png`);
  trayIcon.setContextMenu(menu);
  trayIcon.setToolTip(app.getName());
}
