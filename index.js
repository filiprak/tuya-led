const { app, BrowserWindow, Tray, Menu } = require('electron');


const createWindow = () => {
    if (BrowserWindow.getAllWindows().length > 0)
        return

    const win = new BrowserWindow({
        width: 800,
        height: 600
    })

    win.loadFile('src/index.html')
}

app.whenReady().then(() => {
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
    tray.addListener('click', () => {
        createWindow()
    });

    app.on('activate', () => {
        createWindow()
    })
})

app.on('window-all-closed', () => {
    try {
        app.dock.hide()
    } catch (e) {}

})
