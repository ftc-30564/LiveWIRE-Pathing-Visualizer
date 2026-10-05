const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
const path = require('path');
const fs = require('fs');
const os = require('os');

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
ipcMain.handle('export-json', async (event, name, jsonData) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export JSON File',
    defaultPath: path.join(app.getPath('downloads'), `${name}.json`),
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

ipcMain.handle('send-path-to-robot', async (event, name, pathData) => {
  const tempPath = path.join(os.tmpdir(), `${name}.json`);
  fs.writeFileSync(tempPath, JSON.stringify(pathData, null, 2), 'utf-8');

  const remotePath = '/sdcard/FIRST/paths/' + name + '.json';

  try {
    const { stdout, stderr } = await execPromise(`adb push "${tempPath}" "${remotePath}"`);
    console.log('ADB push succeeded:', stdout);
    return { success: true, message: 'Path sent successfully' };
  } catch (err) {
    console.error('ADB push failed:', err.stderr || err.message);
    return { success: false, message: 'ADB push failed. '+err.stderr || err.message };
  }
});

ipcMain.handle('check-adb', async () => {
  try {
    await execPromise('adb connect 192.168.43.1:5555');
    const { stdout, stderr } = await execPromise('adb devices');
    console.log(stdout);
    console.log(stdout.split('\n').length - 1);
    if ((stdout.split('\n').length - 1) > 2) {
      return { success: true, message: 'Robot is available' };
    }
    else {
      return { success: false, message: 'Robot is not available' };
    }
    
  } catch (err) {
    console.error('ADB check failed:', err.stderr || err.message);
    return { success: false, message: 'An error occured: ' + err.stderr || err.message };
  }
});

ipcMain.handle('list-paths-on-robot', async () => {
  try {
    const { stdout, stderr } = await execPromise('adb shell ls /sdcard/FIRST/paths/');
    console.log('Paths on robot:', stdout);
    const paths = stdout.split('\n').splice(0, stdout.split('\n').length - 1).map(path => path.replace(/\r/g, ""));
    console.log(paths);
    return { success: true, paths: paths };
  } catch (err) {
    console.error('Listing paths failed:', err.stderr || err.message);
    return { success: false, message: 'Failed to list paths on robot. '+err.stderr || err.message };
  }
});

ipcMain.handle('load-path-on-robot', async (event, pathName) => {
  try {
    const { stdout, stderr } = await execPromise(`adb shell cat /sdcard/FIRST/paths/${pathName}`);
    console.log('Path data from robot:', stdout);
    return { success: true, data: JSON.parse(stdout) };
  } catch (err) {
    console.error('Loading path failed:', err.stderr || err.message);
    return { success: false, message: 'Failed to load path from robot. '+err.stderr || err.message };
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

/* example
3
List of devices attached
192.168.43.1:5555       device


3
List of devices attached
192.168.43.1:5555       device
*/