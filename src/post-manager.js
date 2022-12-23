import electron from 'electron';
import sprintfjs from 'sprintf-js';
import path from 'path';
import electronLocalshortcut from 'electron-localshortcut';
import fs from 'fs';

const BrowserWindow = electron.BrowserWindow;
const sprintf = sprintfjs.sprintf;

// const PostsFolder = path.resolve(path.join(__dirname, './posts'));
// const PostsFolder = 'file://' + __dirname + "../posts";
const PostsFolder = '~/work/markit/posts';
const DEFAULT_FOLDER = PostsFolder;

var _windows = [];

class _Instance {
  constructor() {
    this.path = '';
    this.bounds = {};
    this.autoResize = false;
  }
}

export default class PostManager {
  constructor() {
    this.folder = '';
  }

  start(status) {
    const all = {};
    for (let file in status.posts) {
      all[file] = Object.assign(new _Instance(), status.posts[file]);
    }

    this.folder = status.folder;
    this.all = all;

    _openAll(this);

    for (let file in this.all) {
      if (file in _windows) {
        delete this.all[file];
      }
    }
  }

  changeFolder(path) {
    _closeAll(this);

    this.folder = path;
    this.all = [];

    _openAll(this);
  }

  stop() {
    const posts = {};
    for (let file in this.all) {
      posts[file] = {
        autoResize: this.all[file].autoResize,
        bounds: this.all[file].bounds
      };
    }

    return { folder: this.folder, posts };
  }

  open(fullPath) {
    let width = 200, height = 200;
    const file = path.basename(fullPath);
    let instance = this.all[file];
    let bounds;

    if (instance && instance.bounds) {
      bounds = instance.bounds;
      width = bounds.width;
      height = bounds.height;
    } else {
      instance = new _Instance();
      this.all[file] = instance;
    }

    let options = {
      width, height, frame: false, show: false,
      fullscreen: false, minimizable: true, maximizable: false,
      webPreferences: {webSecurity: false}
    };

    if (bounds) {
      Object.assign(options, {x: bounds.x, y: bounds.y});
    }

    const window = new BrowserWindow(options);

    _windows.push(window);

    instance.path = fullPath;

    window.instance = instance;
    window.loadURL(`file://${__dirname}/renderer/post.html`);
    window.setMenu(null);

    const updateBounds = () => {
      Object.assign(window.instance.bounds, window.getBounds());
    };
    window.on('resize', updateBounds);
    window.on('move', updateBounds);

    electronLocalshortcut.register(window,
      'CommandOrControl+Shift+I', () => { window.openDevTools();
    });

    // BrouserWindowインスタンスへの参照を破棄しているだけ。
    // アプリ終了後に参照残りに関連するっぽいエラーが出るが、原因不明。
    // 破棄に関してはこれだけやれば十分なはずだが…
    window.on('closed', () => {
      for(var i = 0; i < _windows.length; i++) {
        if (_windows[i] === window) {
          _windows[i] = null;
          delete _windows[i];
        }
      }
      _windows = _windows.filter((win) => {
        return (win !== null);
      });
    });
  }

  add() {
    const fullPath = _getNewFullPath(this.folder);
    fs.writeFileSync(fullPath, "");
  }

  remove(fullpath) {
    const trashedFilename = `${path.dirname(fullpath)}/trash/${path.basename(fullpath)}`;
    fs.renameSync(fullpath, trashedFilename);
  }
}

function _openAll(post) {
  const files = fs.readdirSync(post.folder);
  if (!files) { throw new Error(); }

  const fullpath = (file) => `${post.folder}/${file}`;
  files.filter((file) => {
    return fs.statSync(fullpath(file)).isFile();
  }).forEach((file) => {
    post.open(fullpath(file));
  });
}

function _closeAll(post) {
  while(_windows.length > 0) {
    _windows[0].close();
  }
}

function _getNewFullPath(folder) {
  const files = fs.readdirSync(folder);
  if (!files) { throw new Error(); }

  let candidate, result = null;
  for (let i = 0; i < 100; i++) {
    candidate = sprintf('post_%03d.txt', i);

    if (!files.includes(candidate)) {
      result = `${folder}/${candidate}`;
      break;
    }
  }

  if (!result) { throw new Error(); }

  return result;
}
