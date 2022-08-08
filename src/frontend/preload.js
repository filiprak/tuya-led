// You can also put expose this code to the renderer
// process with the `contextBridge` API
const { ipcRenderer, contextBridge } = require('electron')

let listener = null;

ipcRenderer.on('message', (event, arg) => {
    listener && listener(arg);
})

contextBridge.exposeInMainWorld('electronAPI', {
    send: (message) => {
        ipcRenderer.send('message', message)
    },
    requestState: () => {
        ipcRenderer.send('message', {
            type: 'request_state'
        })
    },
    listen: (callback) => {
        listener = callback;
    },
})
