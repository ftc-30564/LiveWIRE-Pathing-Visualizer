const { app, BrowserWindow, ipcMain } = require('electron');

// Change this line in main.js:
const StorePkg = require('electron-store');
const Store = StorePkg.default || StorePkg; // Extracts the true constructor

const store = new Store();

ipcMain.handle('get-store-value', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: __dirname + '/preload.js'
    }
  });

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})