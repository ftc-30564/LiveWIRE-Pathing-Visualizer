const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Change this line in main.js:
const StorePkg = require('electron-store');
const Store = StorePkg.default || StorePkg; // Extracts the true constructor

const store = new Store();

// For getting user data
ipcMain.handle('get-store-value', (event, key) => {
  return store.get(key);
});

// For setting user data
ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
});

// For reading JSON files
ipcMain.handle('dialog:openJsonFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'JSON Files', extensions: ['json'] }] // Restrict to JSON
  });

  if (canceled || filePaths.length === 0) {
    return null; // User cancelled the dialog
  }

  try {
    const rawData = fs.readFileSync(filePaths[0], 'utf8');
    return JSON.parse(rawData); // Return parsed JSON data back to renderer
  } catch (error) {
    console.log("there was an error");
    throw error;
  }
});

// For exporting JSON files
ipcMain.handle('export-json', async (event, jsonData) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export JSON File',
    defaultPath: path.join(app.getPath('downloads'), 'data.json'),
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  });

  if (canceled || !filePath) return { success: false, message: 'Export canceled' };

  try {
    // Convert object to pretty JSON and write to disk
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: __dirname + '/preload.js',
      contextIsolation: true,
      nodeIntegration: false 
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