const { ipcMain, app, Menu } = require('electron');
const log = require('./log');
const path = require('path');
const { openDialog, saveDialog, clearStorageDataDialog } = require('./dialogs');
const Updater = require('./Updater');
const mainMenu = require('./mainMenu');
const registerAssetProtocol = require('./assetProtocol').registerProtocol;

function getFileFromArgs(argv) {
  if (!argv) { return null; }
  if (argv.length >= 2) {
    const filePath = argv.find(arg => path.extname(arg) === '.netcanvas');
    if (filePath) {
      log.info('.netcanvas found in argv', JSON.stringify({ argv }, null, 2));
      return filePath;
    }
  }
  return null;
}

class AppManager {
  static openWindow() {
    if (!global.appWindow) { return; }
    global.appWindow.open();
  }

  static removeListeners() {
    ipcMain.removeAllListeners('READY');
    ipcMain.removeAllListeners('QUIT');
    ipcMain.removeAllListeners('ACTION');
  }

  static send(...args) {
    if (!global.appWindow) { return; }
    global.appWindow.webContents.send(...args);
  }

  // Check process.argv after startup (win)
  static checkAndOpenFileFromArgs() {
    log.info('checkAndOpenFileFromArgs', process.argv);
    if (process.platform === 'win32') {
      AppManager.openFileFromArgs(process.argv);
    }
  }

  static openFileFromArgs(argv) {
    log.info('openFileFromArgs', argv);

    if (process.platform === 'win32') {
      const filePath = getFileFromArgs(argv);

      if (filePath) {
        AppManager.openFile(filePath);
      }
    }
  }

  static openFile(fileToOpen) {
    if (!app.isReady()) {
      global.openFileWhenReady = fileToOpen;
      return;
    }

    AppManager.send('OPEN_FILE', fileToOpen);
  }

  static clearStorageData() {
    if (!global.appWindow) { return; }

    global.appWindow.webContents.session.clearStorageData(() => {
      global.appWindow.webContents.reload();
    });
  }

  static saveCopy(filePath) {
    AppManager.send('SAVE_COPY', filePath);
  }

  static save() {
    AppManager.send('SAVE');
  }

  static quit() {
    global.quit = true;

    AppManager.removeListeners();
    app.quit();
  }

  constructor() {
    this.openFileWhenReady = null;
    this.activeProtocol = null;
    this.updater = Updater();

    ipcMain.on('READY', () => {
      log.info('receive: READY');
      AppManager.checkAndOpenFileFromArgs(); // windows

      if (global.openFileWhenReady) {
        AppManager.openFile(global.openFileWhenReady);
        global.openFileWhenReady = null;
      }
    });

    ipcMain.on('QUIT', () => {
      log.info('receive: QUIT');
      AppManager.quit();
    });
  }

  start() {
    log.info('Start appManager');

    global.appWindow.on('focus', () => {
      this.updateMenu();
    });

    global.appWindow.on('close', (e) => {
      if (!global.quit) {
        log.info('send: CONFIRM_CLOSE');
        e.preventDefault();
        AppManager.send('CONFIRM_CLOSE');

        return false;
      }

      return true;
    });

    registerAssetProtocol();
    this.initializeListeners();
    this.updateMenu();
    this.updater.checkForUpdates(true);
  }

  initializeListeners() {
    ipcMain.on('ACTION', (e, action) => {
      log.info('receive: ACTION', action.type);
      switch (action.type) {
        case 'PROTOCOLS/LOAD_SUCCESS':
          this.activeProtocol = action.meta;
          this.updateMenu();
          break;
        case 'SESSION/RESET':
          this.activeProtocol = null;
          this.updateMenu();
          break;
        default:
          log.info(JSON.stringify(action, null, 2));
      }
    });
  }

  updateMenu() {
    const menuOptions = {
      isProtocolOpen: !!this.activeProtocol,
      openFile: () => openDialog().then(file => AppManager.openFile(file)),
      saveCopy: () => {
        const defaultPath = this.activeProtocol.filePath;
        saveDialog({ defaultPath })
          .then(filePath => AppManager.saveCopy(filePath));
      },
      save: () => AppManager.save(),
      clearStorageData: () => clearStorageDataDialog().then(() => AppManager.clearStorageData()),
      checkForUpdates: () => this.updater.checkForUpdates(),
    };

    const appMenu = Menu.buildFromTemplate(mainMenu(menuOptions));
    Menu.setApplicationMenu(appMenu);
  }
}

module.exports = AppManager;
