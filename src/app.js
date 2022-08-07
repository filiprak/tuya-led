const { app, BrowserWindow, Tray, Menu, screen } = require('electron');
const env = require('../.env.json');
const { fork } = require('child_process')
const ApiClient = require('./api');
const LEDStatus = require('./models/led_status');

class App {
    static api = new ApiClient();
    static tray = null;
    static led = new LEDStatus();
    static server = null

    static async setup () {
        await app.whenReady()

        App.server = fork(`${__dirname}/../server.js`)

        App.server.on('message', App.onServerMessage);

        process.on('exit', (code) => {
            App.server.kill('SIGINT')
        });

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

    static async onServerMessage (message) {
        if (message.devId === env.TUYA_DEVICE_ID) {
            App.led = LEDStatus.fromJSON(message.status);
            App.updateTray();
        }
    }
}

module.exports = App;
