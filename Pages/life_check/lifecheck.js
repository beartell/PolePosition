const { count } = require("console");

var PreLoad = function(contentState)
{
    var containerDisplay = document.getElementById("contentContainer");
    containerDisplay.innerHTML = "<div class='col-md-4 p-0' id='leftPart'>"+
    "<div class='container'>"+
      "<div class='styledimg'><img src='PolePosition.png' /></div>"+
      "<div class='ring'></div>"+
      "<div class='ring'></div>"+
      "<div class='ring'></div>"+
    "</div>"+
  "</div>"+
  "<div class='col-md-8' id='contentPart'>"+
  "</div>";

    contentState.Reload();
    containerDisplay.style.marginLeft = "0px";

    return 0;
}

var OnLoad = function(contentState)
{
    var factor = 0;
    const netlib = require("net");

    const lifeServices = contentState.pageContentState["LifeCheckServices"];
    let countServices = 0;
    for(var i = 0; i < lifeServices.length; i++)
    {
        
        var ourElement = document.getElementById("controlBlock");
        var hostSelect = document.createElement("small");
        hostSelect.innerHTML = "Host (" + lifeServices[i].hostMachine + ")<br>";
        ourElement.appendChild(hostSelect);
        for(var j = 0; j < lifeServices[i].openServices.length; j++)
        {
            if(lifeServices[i].openServices[j].port != 0)
            {
              let newText = document.createElement("small");
              newText.innerHTML = "&#x1F534 " + lifeServices[i].openServices[j].service + " (PORT: " + lifeServices[i].openServices[j].port + ")<br>";
              lifeServices[i].openServices[j].service_index = countServices + j;
              newText.id = "control" + (countServices + j);
              ourElement.appendChild(newText);
            }
        }
        countServices += lifeServices[i].openServices.length;
    }

    contentState.SetButtonText("Finish");

    //countServices = 0;
    for(var i = 0; i < lifeServices.length; i++)
    {
        const compIndex = i;
        for(var j = 0; j < lifeServices[i].openServices.length; j++)
        { 
            const serviceIndex = j;
            if(lifeServices[compIndex].openServices[serviceIndex].port == 0)
            {
                continue;
            }
            const connectConfig = {host: lifeServices[compIndex].hostMachine, port: lifeServices[compIndex].openServices[serviceIndex].port};
            const newSocket = netlib.connect(connectConfig);
            newSocket.on("connect", () => {
              lifeServices[compIndex].openServices[serviceIndex].connected = true;
              document.getElementById("control" + lifeServices[compIndex].openServices[serviceIndex].service_index).innerHTML = "&#128994 " + lifeServices[compIndex].openServices[serviceIndex].service + " PORT(" + lifeServices[compIndex].openServices[serviceIndex].port + ")<br>";
            });
            newSocket.on("error", () => {
              for(var k = 0; k < contentState.pageContentState["SSHConnectionInstances"].length; k++)
              {
                if(lifeServices[compIndex].openServices[serviceIndex].system_cmd == "")
                {
                    // DO NOTHING IF THE SYSTEM CMD IS EMPTY
                }
                else
                {
                  contentState.pageContentState["SSHConnectionInstances"][k].selfSsh.execCommand(lifeServices[compIndex].openServices[serviceIndex].system_cmd).then(function(resultCommand){
                    const intervalHandle = setInterval(() => {
                      const mySocket = netlib.connect({host: lifeServices[compIndex].hostMachine, port: lifeServices[compIndex].openServices[serviceIndex].port});
                      mySocket.on("connect", () => {
                        clearInterval(intervalHandle);
                        lifeServices[compIndex].openServices[serviceIndex].connected = true;
                        document.getElementById("control" + lifeServices[compIndex].openServices[serviceIndex].service_index).innerHTML = "&#128994 " + lifeServices[compIndex].openServices[serviceIndex].service + " PORT(" + lifeServices[compIndex].openServices[serviceIndex].port + ")<br>";
                      })
                      mySocket.on("error", () => {
                        
                      })
                    }, 1000);
                    
                  })
                }
              }
            })  
        }
        
        //countServices += lifeServices[i].openServices.length;
    }
}

var exportFunctions = [PreLoad, OnLoad];
module.exports = exportFunctions;