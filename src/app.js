const { app, BrowserWindow, Tray, Menu, screen } = require('electron');

class App {
    static async setup () {
        await app.whenReady()

        App.createTray()

        app.on('activate', () => {
            App.toggleWindow(true);
        })

        app.on('window-all-closed', () => {
            try {
                app.dock.hide()
            } catch (e) {}
        })
    }

    static async createWindow () {
        const win = new BrowserWindow({
            icon: 'assets/icons/icon.png',
            width: 800,
            height: 600,
        })

        return win.loadFile('src/index.html')
    }

    static createTray() {
        const tray = new Tray('assets/icons/icon.png')
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Settings',
                click: () => {
                    App.toggleWindow(true);
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
            App.toggleWindow();
        });

        return tray;
    }

    static async toggleWindow (open) {
        open = open !== undefined ? open : BrowserWindow.getAllWindows().length < 1

        if (open) {
            if (BrowserWindow.getAllWindows().length < 1) {
                await App.createWindow()
            }
        } else {
            BrowserWindow
                .getAllWindows()
                .forEach(i => i.close());
        }
    }
}

module.exports = App;
