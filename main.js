const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require("path");
const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 400,
      useContentSize: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
        contextIsolation: false,
      },
      icon: './resources/app/icon.png'
    })
    
    ipcMain.handle("pole-error-dialog", (e, title, msg) => {
      const dialogOptions = {
          message: msg,
          title: title,
          type: "error"
      };
      console.log(e);
        dialog.showMessageBoxSync(win, dialogOptions);
    });

    ipcMain.handle("pole-app-close", (e) => {
      win.close();
    });

    win.setResizable(false);
    win.loadFile('index.html');
    win.setMenu(null);
}

app.whenReady().then(() => {
    createWindow();
})
  