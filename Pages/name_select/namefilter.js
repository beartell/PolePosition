const { NodeSSH } = require("node-ssh");

var PreLoad = function(contentState)
{
    let logViewer = document.getElementById("logMessage");
    let domainContainer = document.getElementById("textContainer");
    let inputDomains = domainContainer.children;

    if(contentState.pageContentState["RemoteControlObject"] != undefined)
    {
        clearInterval(contentState.pageContentState["RemoteControlObject"].intervalInstance);
        contentState.pageContentState["RemoteControlObject"].remoteMachines.forEach((remoteObjInstance) => {
            // DISCONNECT IF CONNECTED
            remoteObjInstance.selfSsh.dispose();
        })
    }

    contentState.pageContentState["DomainInputs"] = new Array();
    contentState.pageContentState["DeadMachines"] = new Set();
    contentState.pageContentState["RemoteControlObject"] = {remoteMachines: new Array(), connectedCount: 0, intervalInstance: -1};

    for(var i = 0; i < inputDomains.length; i++)
    {
        if(contentState.pageContentState["DomainInputs"].indexOf(inputDomains[i].value) !== -1)
        {
            logViewer.innerHTML = "*Domain fields can not be same";
            logViewer.style.display = "block";
            return 1;
        }

        if(inputDomains[i].value == "")
        {
            logViewer.innerHTML = "*Domain fields can not be blank";
            logViewer.style.display = "block";
            return 1;
        }
        const tempNode = new NodeSSH();
        
        let remoteObject = {selfSsh : tempNode, hostInfo: inputDomains[i].value, outputLog : "", cmdIndex : 0};
        contentState.pageContentState["RemoteControlObject"].remoteMachines.push(remoteObject);
        contentState.pageContentState["DomainInputs"].push(inputDomains[i].value);
    }

    return 0;
}

var OnLoad = function(contentState)
{
    var methodSelection = document.getElementById("sshMethod");
    var credContainer = document.getElementById("credentialsContainer");
    var keyContainer = document.getElementById("sshFileContainer");
    
    keyContainer.style.display = "none";

    contentState.pageContentState["SSHMethod"] = 0;
    methodSelection.onchange = function () {
        
        if(methodSelection.value == "Credentials")
        {
            keyContainer.style.display = "none";
            credContainer.style.display = "block";
            contentState.pageContentState["SSHMethod"] = 0;
        }
        else{
            credContainer.style.display = "none";
            keyContainer.style.display = "block";
            contentState.pageContentState["SSHMethod"] = 1;
        }
    }
}

var exportFunctions = [PreLoad, OnLoad];
module.exports = exportFunctions;