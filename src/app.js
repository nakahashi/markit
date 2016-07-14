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

const _post = new PostManager();
let _watcher = null;

app.on('ready', () => {
  let status;
  try {
    const content = fs.readFileSync(STATUS_FILE, 'utf8');
    status = content ? JSON.parse(content) : {};
  } catch (e) {
    status = {};
  }

  _post.start(status);

  _createTrayIcon();

  _watcher = chokidar.watch(_post.folder, {ignoreInitial: true});
  _watcher.on('add', _post.open.bind(_post));
});

app.on('before-quit', (event) => {
  const status = _post.stop();
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, '  '));
});

app.on('window-all-closed', () => {});

ipcMain.on('add-post', () => _post.add());

function _createTrayIcon() {
  const menuTemplate = [
    { label: '新しい付箋', click: _post.add.bind(_post) },
    { label: '付箋フォルダ指定...', click: ()=> {
      const options = {
        title: '付箋フォルダを選択してください。',
        properties: ['openDirectory']
      };
      const directories = dialog.showOpenDialog(options);
      if (directories && directories[0]) {
        _watcher.close();

        _post.changeFolder(directories[0]);
        _watcher = chokidar.watch(_post.folder, {ignoreInitial: true});
        _watcher.on('add', _post.open.bind(_post));
      }
    }},
    { label: '付箋フォルダを開く', click: ()=> {
      shell.openItem(_post.folder);
    }},
    { label: '終了', click: app.quit }
  ];

  const trayIcon = new Tray(`${__dirname}/../icons/tag-32.png`);
  trayIcon.setContextMenu(Menu.buildFromTemplate(menuTemplate));
  trayIcon.setToolTip(app.getName());
}
