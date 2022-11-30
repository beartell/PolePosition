var PreLoad = function(contentState)
{
    // If it returns 0
    // We can proceed
    
    var masterNodeSelector = document.getElementById("masterSelect");
    contentState.pageContentState["MasterNode"] = masterNodeSelector.value;

    return 0;
}

var OnLoad = function(contentState)
{
    let componentObjects = {component_configurations : undefined};
    if(contentState.pageContentState["ComponentList"] == undefined)
    {
        const fs = require("fs");
        let resultRaw = fs.readFileSync("./resources/app/components.json");
        componentObjects = JSON.parse(resultRaw);
        contentState.pageContentState["ComponentList"] = componentObjects;
    }

    else
    {
        componentObjects = contentState.pageContentState["ComponentList"];
    }
    
    const rightHalf = Math.floor(componentObjects.component_configurations.length / 2);
    
    var leftContainer = document.getElementById("leftSide");
    var rightContainer = document.getElementById("rightSide");

    let componentCounter = 0;
    for(var i = 0; i < componentObjects.component_configurations.length / 2; i++)
    {
        let tempElement = document.createElement("input");
        tempElement.type = "checkbox";
        tempElement.style.padding = "2px";
        tempElement.id = "comp" + componentCounter;
        tempElement.name = "comp" + componentCounter;
        tempElement.value = componentObjects.component_configurations[componentCounter].comp_name  ;
        if(componentObjects.component_configurations[componentCounter].display_state == false)
        {
            tempElement.style.display= "none";
        }
        leftContainer.appendChild(tempElement);

        tempElement = document.createElement("label");
        tempElement.for = "comp" + componentCounter;
        tempElement.innerHTML = componentObjects.component_configurations[componentCounter].comp_name;
        if(componentObjects.component_configurations[componentCounter].display_state == false)
        {
            tempElement.style.display= "none";
        }
        
        leftContainer.appendChild(tempElement);      
        tempElement = document.createElement("br");
        leftContainer.appendChild(tempElement);
        componentCounter++;
    }

    for(var i = 0; i < rightHalf; i++)
    {
        let tempElement = document.createElement("input");
        tempElement.style.padding = "2px";
        tempElement.type = "checkbox";
        tempElement.id = "comp" + componentCounter;
        tempElement.name = "comp" + componentCounter;
        tempElement.value = componentObjects.component_configurations[componentCounter].comp_name;
        if(componentObjects.component_configurations[componentCounter].display_state == false)
        {
            tempElement.style.display= "none";
        }
        rightContainer.appendChild(tempElement);

        tempElement = document.createElement("label");
        tempElement.for = "comp" + componentCounter;
        tempElement.innerHTML = componentObjects.component_configurations[componentCounter].comp_name;
        if(componentObjects.component_configurations[componentCounter].display_state == false)
        {
            tempElement.style.display= "none";
        }
        
        rightContainer.appendChild(tempElement);      
        tempElement = document.createElement("br");
        rightContainer.appendChild(tempElement);
        componentCounter++;
    }
    
    for(var i = 0; i < contentState.pageContentState["ComponentList"].component_configurations.length; i++)
    {
        var compObject = document.getElementById("comp" + i);
        compObject.checked = contentState.pageContentState["ComponentList"].component_configurations[i].click_state;
    }
}

var exportFunctions = [PreLoad, OnLoad];

module.exports = exportFunctions;