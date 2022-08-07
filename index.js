const { app, BrowserWindow, Tray, Menu } = require('electron');


const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600
    })

    win.loadFile('src/index.html')
}

app.whenReady().then(() => {
    // createWindow()
    const tray = new Tray('assets/icons/icon.png')
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Settings',
            click: () => {
                createWindow()
            },
        },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            },
        },
    ])
    tray.setToolTip('Tuya LED controller')
    tray.setContextMenu(contextMenu)

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        // if (BrowserWindow.getAllWindows().length === 0)
        //     createWindow()
    })
})

app.on('window-all-closed', () => {
    app.dock.hide()
})
