const { app, BrowserWindow, ipcMain } = require('electron/main')
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('node:path')
const getMemoryAddressesWindows = require('./api')

async function handleFindClientProcess() {
    // RobloxPlayerBeta.exe
    const { err, stdout } = await exec('tasklist /fi "IMAGENAME eq notepad.exe"');
    if (err) return null

    try {
        let lines = stdout.split('\n')
        lines = lines[3].split(/\s+/)

        let pid = parseInt(lines[1])

        let range = getMemoryAddressesWindows(pid)

        return range[0] + " -> " + range[1]
    } catch (e) {
        return null
    }
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        resizable: false,
        autoHideMenuBar: true,
        frame: false,
        titleBarStyle: 'hidden'
    })

    mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
    ipcMain.handle('find-client-process', handleFindClientProcess)

    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})