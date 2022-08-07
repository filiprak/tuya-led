const { app, BrowserWindow, Tray, Menu, screen } = require('electron');
const ApiClient = require('./api');
const LEDStatus = require('./models/led_status');

class App {
    static api = new ApiClient();
    static tray = null;
    static led = new LEDStatus();

    static async setup () {
        await app.whenReady()

        app.on('activate', () => {
            App.toggleWindow(true);
        })

        app.on('window-all-closed', () => {
            try {
                app.dock.hide()
            } catch (e) {}
        })

        App.tray = App.createTray()
        App.led = await App.api.getLEDStatus()
        App.updateTray()
    }

    static async createWindow () {
        const win = new BrowserWindow({
            icon: 'assets/icons/on.png',
            width: 800,
            height: 600,
        })

        return win.loadFile('src/index.html')
    }

    static createTray() {
        const tray = new Tray('assets/icons/off.png')
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

        tray.addListener('click', async () => {
            if (!App.led.isLoading()) {
                App.led.setLoading(true)

                await App.api.toggleLED();

                App.led.setEnabled(!App.led.isEnabled());
                App.updateTray();
                App.led.setLoading(false)
            }
        });

        return tray;
    }

    static updateTray() {
        App.tray.setImage(App.led.isEnabled() ? 'assets/icons/on.png' : 'assets/icons/off.png');
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
