var PreLoad = function(contentState)
{
    // Validate every input field in #textContainer and collect values
    var container = document.getElementById("textContainer");
    var inputs = container.getElementsByTagName("input");
    var collectedPaths = [];
    var allFilled = true;

    for (var i = 0; i < inputs.length; i++)
    {
        var val = inputs[i].value.trim();
        if(val === "")
        {
            allFilled = false;
            break;
        }
        collectedPaths.push(val);
    }

    if(!allFilled)
    {
        var lgMsg = document.getElementById("logMessage");
        lgMsg.style.display = "block";
        return 1;
    }

    contentState.pageContentState["PathInput"] = collectedPaths;
    return 0;
}

var OnLoad = function(contentState)
{
    var addPathButton = document.getElementById("pathAddButton");
    var removePathButton = document.getElementById("pathRemoveButton");
    var pathContainer = document.getElementById("textContainer");
    var ourPaths = pathContainer.children;
    addPathButton.addEventListener('click', () => {
        var newPath = document.createElement("input");
        newPath.type = "text";
        newPath.className = "w-100 mb-1";
        newPath.id = "pathInput" + ourPaths.length;
        newPath.placeholder = "/home/data/" + ourPaths.length;
        pathContainer.appendChild(newPath);
    });

    removePathButton.addEventListener('click', () => {
        // Do not remove the last input
        if(ourPaths.length != 1)
        {
            pathContainer.removeChild(pathContainer.lastChild);
        }
    });
    contentState.SetButtonText("Install");
}

var exportFunctions = [PreLoad, OnLoad];

module.exports = exportFunctions;