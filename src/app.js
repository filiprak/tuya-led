const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const env = require('../.env.json');
const { fork } = require('child_process')
const ApiClient = require('./api');
const LEDStatus = require('./models/led_status');

class AppIcons {
    static ON = path.resolve(__dirname, '..', 'assets/icons/on.png')
    static OFF = path.resolve(__dirname, '..', 'assets/icons/off.png')
}

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

        ipcMain.on('message', (event, arg) => {
            App.onFrontendMessage(arg);
        })

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
            icon: AppIcons.ON,
            width: 500,
            height: 500,
            webPreferences: {
                preload: `${__dirname}/frontend/preload.js`
            },
            autoHideMenuBar: true,
        })

        return win.loadFile('src/index.html')
    }

    static getWindow() {
        return BrowserWindow.getAllWindows()[0] || null
    }

    static createTray() {
        const tray = new Tray(AppIcons.OFF)
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
        App.tray.setImage(App.led.isEnabled() ? AppIcons.ON : AppIcons.OFF);
        App.tray.setToolTip(App.led.isEnabled() ? 'Tuya LED controller: On' : 'Tuya LED controller: Off');
    }

    static async toggleWindow (open) {
        open = open !== undefined ? open : BrowserWindow.getAllWindows().length < 1

        if (open) {
            if (BrowserWindow.getAllWindows().length < 1) {
                await App.createWindow()
            }
            if (App.getWindow()) {
                App.getWindow().show()
            }
        } else {
            BrowserWindow
                .getAllWindows()
                .forEach(i => i.close());
        }
    }

    static async onServerMessage (message) {
        if (message.devId === env.TUYA_DEVICE_ID) {
            App.led.merge(message.status);
            App.updateTray();

            const win = App.getWindow();

            if (win) {
                win.webContents.send('message', message)
            }
        }
    }

    static async onFrontendMessage (message) {
        if (message.type === 'request_state') {
            const win = App.getWindow();

            if (win) {
                win.webContents.send('message', {
                    status: [
                        {
                            code: 'colour_data',
                            t: 0,
                            value: App.led.getColourData()
                        }
                    ]
                })
            }
        } else {
            if (!App.led.isEnabled()) {
                await App.api.switchLED(true)
            }
            await App.api.setLEDColor(message.color);
        }
    }
}

module.exports = App;
