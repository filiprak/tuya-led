// You can also put expose this code to the renderer
// process with the `contextBridge` API
const { ipcRenderer, contextBridge } = require('electron')

ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg) // prints "pong" in the DevTools console
})

ipcRenderer.on('message', (event, arg) => {
    console.log('message', arg) // prints "pong" in the DevTools console
})

contextBridge.exposeInMainWorld('electronAPI', {
    send: (message) => {
        ipcRenderer.send('asynchronous-message', message)
    },
    listen: () => {

    },
})
