const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  selectAndReadJson: () => ipcRenderer.invoke('dialog:openJsonFile'),
  exportJSON: (name, data) => ipcRenderer.invoke('export-json', name, data),
  sendPathToRobot: (name, pathData) => ipcRenderer.invoke('send-path-to-robot', name, pathData),
  checkAdb: () => ipcRenderer.invoke('check-adb'),
  listPathsOnRobot: () => ipcRenderer.invoke('list-paths-on-robot'),
  loadPathOnRobot: (pathName) => ipcRenderer.invoke('load-path-on-robot', pathName),
  onUndo: cb => ipcRenderer.on('undo', cb)
});
