var PreLoad = function(contentState)
{
    // If it returns 0
    // We can proceed

    if(contentState.pageContentState["SSHMethod"] == undefined)
    {
        return 1;
    }

    if(contentState.pageContentState["SSHMethod"] == 0)
    {
        var sshUser = document.getElementById("sshUsername");
        var sshPass = document.getElementById("sshPassword");
        var logSection = document.getElementById("logMessage");

        if(sshUser.value == "")
        {
            logSection.innerHTML = "*Name field can not be blank";
            logSection.style.display = "block";
            return 1;
        }

        if(sshPass.value == "")
        {
            logSection.innerHTML = "*Password field can not be blank";
            logSection.style.display = "block";
            return 1;
        }
        contentState.pageContentState["SSHUsername"] = sshUser.value;
        contentState.pageContentState["SSHPassword"] = sshPass.value;
    }

    else
    {
        var keyLocation = document.getElementById("keyFileInput").files[0];
        if(keyLocation == "")
        {
            logSection.innerHTML = "*Key file must be supplied";
            logSection.style.display = "block";
            return 1;
        }

        var fReader = new FileReader();
        fReader.readAsBinaryString(document.getElementById("keyFileInput").files[0]);
        contentState.pageContentState["SSHFile"] = keyLocation;
    }

    contentState.pageContentState["RemoteControlObject"].intervalInstance = setInterval(() => {
        if(contentState.pageContentState["RemoteControlObject"].connectedCount == contentState.pageContentState["RemoteControlObject"].remoteMachines.length)
        {
            clearInterval(contentState.pageContentState["RemoteControlObject"].intervalInstance);
            return 1;
        }
        contentState.pageContentState["RemoteControlObject"].remoteMachines.forEach((remoteObjInstance) => {
            const remoteUname = contentState.pageContentState["SSHUsername"];
            const remotePass = contentState.pageContentState["SSHPassword"];
            const myConfig = {
                host : remoteObjInstance.hostInfo,
                username: remoteUname,
                port: 22,
                password: remotePass,
                tryKeyboard : false
            };
            
            remoteObjInstance.selfSsh.connect(myConfig).then(() => {
                contentState.pageContentState["RemoteControlObject"].connectedCount++;
            }, (err) => {
                console.log(err);
                console.log(contentState.pageContentState["DeadMachines"]);
                contentState.pageContentState["DeadMachines"].add(remoteObjInstance.hostInfo);
                contentState.pageContentState["RemoteControlObject"].connectedCount = 0;
                contentState.pageContentState["RemoteControlObject"].remoteMachines.forEach((newRemoteObj) => {
                    newRemoteObj.selfSsh.dispose();
                })
            })
        })
    }, 500);

    return 0;
}

var OnLoad = function(contentState)
{
    var masterNodeSelector = document.getElementById("masterSelect");
    
    for(var i = 0; i < contentState.pageContentState["DomainInputs"].length; i++)
    {
        var optionElement = document.createElement("option");
        optionElement.value = contentState.pageContentState["DomainInputs"][i];
        optionElement.innerHTML = contentState.pageContentState["DomainInputs"][i];
        masterNodeSelector.appendChild(optionElement);
    }

    if(contentState.pageContentState["MasterNode"] != undefined)
    {
        masterNodeSelector.value = contentState.pageContentState["MasterNode"];
    }
}

var exportFunctions = [PreLoad, OnLoad];

module.exports = exportFunctions;