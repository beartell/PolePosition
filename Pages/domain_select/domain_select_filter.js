var PreLoad = function(contentState)
{
    return 0;
}

var OnLoad = function(contentState)
{
    var addDomainButton = document.getElementById("domainAdd");
    var removeDomainButton = document.getElementById("rmvButton");
    var domainContainer = document.getElementById("textContainer");

    addDomainButton.addEventListener('click', () => {
        var newDomain = document.createElement("input");
        newDomain.type = "text";
        newDomain.className = "w-100 mb-1";
        newDomain.id = "domainInput" + domainContainer.children.length;

        domainContainer.appendChild(newDomain);
    })

    removeDomainButton.addEventListener('click', () => {
        if(domainContainer.children.length <= 1)
        {
            // Do not remove the last element
            return;
        }
        
        contentState.pageContentState["DomainInputs"].pop();
        domainContainer.removeChild(domainContainer.lastChild);
    })

    if(contentState.pageContentState["DomainInputs"] == undefined)
    {   
        var domainInputArray = new Array();
        contentState.pageContentState.push("DomainInputs");
        contentState.pageContentState["DomainInputs"] = domainInputArray;
    }

    var inputCount = contentState.pageContentState["DomainInputs"].length;

    if(inputCount == 0)
    {
        // NOTHING TO DO SINCE THERE ARE NO INPUTS
        return 0;
    }

    var domainRows = domainContainer.children;
    domainRows[0].value = contentState.pageContentState["DomainInputs"][0];

    for(var i = 1; i < inputCount; i++)
    {
        var domainInputString = contentState.pageContentState["DomainInputs"][i];
        var newDomain = document.createElement("input");
        newDomain.type = "text";
        newDomain.className = "w-100 mb-1";
        newDomain.value = domainInputString;
        newDomain.id = "domainInput" + i;

        domainContainer.appendChild(newDomain);
    }
}

var exportFunctions = [PreLoad, OnLoad];

module.exports = exportFunctions;