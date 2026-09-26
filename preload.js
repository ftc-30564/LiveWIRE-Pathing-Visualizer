const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  selectAndReadJson: () => ipcRenderer.invoke('dialog:openJsonFile'),
  exportJSON: (data) => ipcRenderer.invoke('export-json', data),
  sendPathToRobot: (name, pathData) => ipcRenderer.invoke('send-path-to-robot', name, pathData)
});
