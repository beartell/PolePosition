var PreLoad = function(contentState){
    const {ipcRenderer} = require("electron");
    ipcRenderer.invoke("pole-app-close");
    return 0;
}

var OnLoad = function(contentState){
    return 0;
}

var exportFunctions = [PreLoad, OnLoad];
module.exports = exportFunctions;