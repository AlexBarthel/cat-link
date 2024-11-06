const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('contextBridge', {
    findClientProcess: () => ipcRenderer.invoke('find-client-process')
})