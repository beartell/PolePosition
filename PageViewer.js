class PolePageViewer{
    #contentData;
    #nextButton;
    #previousButton;
    #documentField;
    #pageIndex = 0;
    #pageList = new Array();

    pageContentState = new Array();
    services = new Array();

    constructor(page_config, fieldId, nextId, prevId)
    {
        this.#documentField = document.getElementById(fieldId);
        this.#nextButton = document.getElementById(nextId);
        this.#previousButton = document.getElementById(prevId);

        this.#nextButton.addEventListener('click', () => {
            this.NextPage();
        });

        this.#previousButton.addEventListener('click', () => {
            this.PreviousPage();
        });

        this.#previousButton.disabled = true;

        this.#contentData = JSON.parse(page_config);  

        var fileSystem = require('fs');

        for(var i = 0; i < this.#contentData.pagelist.length; i++)
        {
            var pageDescriptor = { filterScript : undefined, contentString : ""};
            try{
                if(this.#contentData.pagelist[i].filter == "")
                {
                    // DO NOTHING
                }
                else
                {
                    pageDescriptor.filterScript = require(this.#contentData.pagelist[i].filter);
                    // loadScript = pageDescriptor.filterScript.OnLoad(undefined);
                    // preLoadScript = pageDescriptor.filterScript.PreLoad(undefined);
                }
                
                pageDescriptor.contentString = fileSystem.readFileSync(this.#contentData.pagelist[i].content);
                //pageDescriptor.contentString = this.#contentData.pagelist[i].content;
                this.#pageList.push(pageDescriptor);
            } catch(err){
                console.log(err);
            }
            
        }

        if(this.#pageList.length == 1 || this.#pageList.length == 0)
        {
            this.#nextButton.disabled = true;
        }

        this.#documentField.innerHTML = this.#pageList[0].contentString;
        this.#pageIndex = 1;

    }

    NextPage()
    {
        if(this.#pageIndex <= 0)
        {
            // First page is exception
            // Directly render page without filter
            this.#pageIndex = 1;
            this.#documentField.innerHTML = this.#pageList[this.#pageIndex].contentString;
            this.#pageIndex++;
        }

        else
        {
            this.#previousButton.disabled = false;
            var actionScript = this.#pageList[this.#pageIndex];
            
            if(actionScript == undefined)
            {
                this.#documentField.innerHTML = this.#pageList[this.#pageIndex].contentString;
                this.#pageIndex++;
            }

            else
            {
                var valueCheck = this.#pageList[this.#pageIndex].filterScript[0](this);
                if(valueCheck == 0)
                {
                    this.#documentField.innerHTML = this.#pageList[this.#pageIndex].contentString; 
                    this.#pageList[this.#pageIndex].filterScript[1](this);
                    this.#pageIndex++;
                }
            }
        }

        if(this.#pageIndex >= this.#pageList.length)
        {
            this.#nextButton.disabled = true;
        }
    }
    PreviousPage()
    {
        this.#nextButton.disabled = false;
        this.#nextButton.innerHTML = "Next";
        if(this.#pageIndex <= 0)
        {
            // First page is exception
            // Directly render page without filter
            this.#documentField.innerHTML = this.#pageList[0].contentString;
            this.#previousButton.disabled = true;
            this.#pageIndex = 1;
        }

        
        else
        {
            this.#pageIndex -= 2;
            var actionScript = this.#pageList[this.#pageIndex];
            if(actionScript.filterScript == undefined)
            {
                if(this.#pageIndex <= 0)
                {
                    this.#previousButton.disabled = true;
                }
                this.#documentField.innerHTML = this.#pageList[this.#pageIndex].contentString;
                this.#pageIndex++;
            }

            else
            {
                this.#documentField.innerHTML = this.#pageList[this.#pageIndex].contentString;    
                this.#pageList[this.#pageIndex].filterScript[1](this);
                this.#pageIndex++;
            }
        }
    }

    SetButtonText(value)
    {
        this.#nextButton.innerHTML = value;
    }

    ButtonSetState(which, state)
    {
        if(which == "back")
        {
            this.#previousButton.disabled = state;
            return 0;
        }

        else if(which == "next")
        {
            this.#nextButton.disabled = state;
            return 0;
        }

        return 1;
    }

    Reload()
    {
        this.#documentField = document.getElementById("contentPart");
    }

    DisableFooterPart()
    {
        var footerButtons = document.getElementById("footerButtons");
        footerButtons.style.display = "none";
    }
}

module.exports = PolePageViewer;