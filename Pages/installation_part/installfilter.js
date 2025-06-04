var totalDomainInputs;
var sshCommandList;
var globalCommandCounter;
var connectionInfoObjects;
var sshLogObject;
var domainSelector;
var workingDomain;
var myContentState;
var promSSHInstance;
var promCounter;

function RemainingPercentage()
{
    const totalLength = (sshCommandList.length * totalDomainInputs.length);
    var currentVal = (100 * globalCommandCounter) / totalLength;
    return currentVal;
}

function UpdatePercentage() {
    
    document.getElementById("installProgress").style.width = RemainingPercentage() + '%';
    document.getElementById("cmdDisplayer").innerHTML = '%' + Math.floor(RemainingPercentage());
} 

function LogSelection()
{
    var outDomain = domainSelector.value;
    for(var i = 0; i < connectionInfoObjects.length; i++)
    {
        if(outDomain == connectionInfoObjects[i].hostInfo)
        {
            workingDomain = connectionInfoObjects[i];
            sshLogObject.value = workingDomain.outputLog;
            return;
        }
    }
}

function ExecuteRecursive(connectionInstance)
{
    if(connectionInstance.cmdIndex == sshCommandList.length)
    {
        return;
    }

    connectionInstance.selfSsh.execCommand(sshCommandList[connectionInstance.cmdIndex]).then(function(cmdResult){

        if(cmdResult.stdout != "")
        {
            connectionInstance.outputLog += 'STDOUT: ' + cmdResult.stdout + '\n';
        }

        if(cmdResult.stderr != "")
        {
            connectionInstance.outputLog += 'STDERR: ' + cmdResult.stderr + '\n';
        }

        globalCommandCounter++;
        UpdatePercentage();
        const totalLength = (sshCommandList.length * totalDomainInputs.length);
        if(totalLength / globalCommandCounter == 1)
        {
            myContentState.ButtonSetState("back", true);
            myContentState.ButtonSetState("next", false);
        }
        connectionInstance.outputLog += 'STDOUT: ' + cmdResult.stdout + '\n';
        connectionInstance.outputLog += 'STDERR: ' + cmdResult.stderr + '\n';
        sshLogObject.value = workingDomain.outputLog;
        connectionInstance.cmdIndex++;
        ExecuteRecursive(connectionInstance);
    })
}

function ShellExecutor()
{
    for(var i = 0; i < connectionInfoObjects.length; i++)
    {
        const cnInfo = connectionInfoObjects[i];
        cnInfo.selfSsh.execCommand(sshCommandList[cnInfo.cmdIndex]).then(function(cmdResult){
            if(cmdResult.stdout != "")
            {
                cnInfo.outputLog += 'STDOUT: ' + cmdResult.stdout + '\n';
            }

            if(cmdResult.stderr != "")
            {
                cnInfo.outputLog += 'STDERR: ' + cmdResult.stderr + '\n';
            }

            globalCommandCounter++;
            UpdatePercentage();
            sshLogObject.value = workingDomain.outputLog;
            cnInfo.cmdIndex++;
            ExecuteRecursive(cnInfo);  
        })

    }
}

function StartRemoteInstallation()
{
    const totalComponents = myContentState.pageContentState["ComponentList"]; // ARRAY
    const totalPathInputs = myContentState.pageContentState["PathInput"]; // ARRAY

    const givenRepoUrl = myContentState.pageContentState["SelectedUrl"]; // STRING
    const givenMasterNode = myContentState.pageContentState["MasterNode"]; // STRING

    let bigtopVersion = "3.2.0";
    const versionMatch = givenRepoUrl.match(/releases\/(\d+\.\d+\.\d+)\//);
    if(versionMatch && versionMatch[1])
    {
        bigtopVersion = versionMatch[1];
    }

    sshCommandList = new Array();
    globalCommandCounter = 0;
    connectionInfoObjects = new Array();
    sshLogObject = undefined;
    domainSelector = undefined;
    workingDomain = undefined

    var componentsString = "";
    for(var i = 0; i < totalComponents.component_configurations.length; i++)
    {
        if(myContentState.pageContentState["ComponentList"].component_configurations[i].click_state == true)
        {
            if(totalComponents.component_configurations[i].comp_name != "default_services")
            {
                componentsString += "- " + totalComponents.component_configurations[i].comp_name + "\n";
            }
            
        }
        
    }
    
    var storageDirectories = "";

    for(var i = 0; i < totalPathInputs.length; i++)
    {
        storageDirectories += "- " + totalPathInputs[i] + "\n";
    }
    
    var zookeeperEnsemble = "hadoop_zookeeper::server::ensemble:\n";
    for(var i = 1; i <= totalDomainInputs.length; i++) {
	zookeeperEnsemble += `  - ['${i}', '${totalDomainInputs[i-1]}:2888:3888']\n`;
    }

    var variadicCommand = "sudo su root -c \"cat > /etc/puppet/hieradata/site.yaml << EOF\n"+
    "---\n"+
    "bigtop::hadoop_head_node: '" + givenMasterNode + "'\n"+
    "hadoop::hadoop_storage_dirs:\n"+
    storageDirectories + zookeeperEnsemble +
    "hadoop_cluster_node::cluster_components:\n- hdfs-non-ha\n- zookeeper\n- yarn\n"+ componentsString +
    "bigtop::jdk_package_name: \"java-1.8.0-openjdk-devel.x86_64\"\n"+
    "bigtop::bigtop_repo_uri: \"" + givenRepoUrl + "\"\nEOF\n\"";

    console.log(variadicCommand);

    var exporterService = "cat > /etc/systemd/system/node_exporter.service << EOF\n"+
    "[Unit]\n"+
    "Description=Node Exporter\n"+
    "After=network.target\n\n"+
    "[Service]\n"+
    "User=node_exporter\n"+
    "Group=node_exporter\n"+
    "Type=simple\n"+
    "ExecStart=/usr/local/bin/node_exporter\n\n"+
    "[Install]\n"+
    "WantedBy=multi-user.target\n"+
    "EOF\n";

    sshCommandList.push("sudo yum -y install wget");
    sshCommandList.push("sudo yum -y install net-tools");
    sshCommandList.push("sudo yum -y install git");
    sshCommandList.push("wget https://github.com/prometheus/node_exporter/releases/download/v1.4.0/node_exporter-1.4.0.linux-amd64.tar.gz");
    sshCommandList.push("cp node_exporter-1.4.0.linux-amd64.tar.gz /usr/src/");
    sshCommandList.push("tar -xf /usr/src/node_exporter-1.4.0.linux-amd64.tar.gz");
    sshCommandList.push("cp node_exporter-1.4.0.linux-amd64/node_exporter /usr/local/bin/");
    sshCommandList.push("sudo adduser -M -r -s /sbin/nologin node_exporter");
    sshCommandList.push(exporterService);
    sshCommandList.push("sudo systemctl daemon-reload");
    sshCommandList.push("sudo systemctl enable --now node_exporter");
    sshCommandList.push("sudo rpm -ivh http://yum.puppetlabs.com/puppet5-release-el-8.noarch.rpm");
    sshCommandList.push("sudo yum -y install puppet");
    sshCommandList.push("/opt/puppetlabs/bin/puppet module install puppetlabs-stdlib --version 4.12.0");
    sshCommandList.push("sudo git clone https://github.com/beartell/bigtop.git /bigtop-home");
    sshCommandList.push("sudo sh -c \"cd /bigtop-home; git checkout release-" + bigtopVersion + "\"");
    sshCommandList.push("sudo cp -r /bigtop-home/jmx_exporter/ /usr/lib/");
    sshCommandList.push("sudo cp -r /bigtop-home/jmx_exporter/ /usr/lib/");
    sshCommandList.push("sudo cp -r /bigtop-home/jmx_exporter/ /usr/lib/");
    sshCommandList.push("sudo cp -r /bigtop-home/bigtop-deploy/puppet/hieradata/ /etc/puppet/");
    sshCommandList.push("sudo cp -r /bigtop-home/bigtop-deploy/puppet/hieradata/ /etc/puppet/");
    sshCommandList.push("sudo cp -r /bigtop-home/bigtop-deploy/puppet/hieradata/ /etc/puppet/");
    sshCommandList.push("sudo cp -r /bigtop-home/bigtop-deploy/puppet/hieradata/ /etc/puppet/");
    sshCommandList.push("sudo cp -r /bigtop-home/bigtop-deploy/puppet/hieradata/ /etc/puppet/");
    sshCommandList.push("sudo cp /bigtop-home/bigtop-deploy/puppet/hiera.yaml /etc/puppet/");
    sshCommandList.push("sudo find /etc/puppet");
    sshCommandList.push("sudo mkdir -p /var/lib/zookeeper/ && hostname | tr -dc '1-9' | sudo tee -a /var/lib/zookeeper/myid");
    sshCommandList.push(variadicCommand);
    sshCommandList.push("/opt/puppetlabs/bin/puppet apply --hiera_config=/etc/puppet/hiera.yaml --modulepath=/bigtop-home/bigtop-deploy/puppet/modules:/etc/puppet/modules:/usr/share/puppet/modules:/etc/puppetlabs/code/environments/production/modules /bigtop-home/bigtop-deploy/puppet/manifests");
    sshCommandList.push("sleep 5");
    sshCommandList.push("echo Install finished.");

    var myContent = document.getElementById("contentContainer");

    myContent.style.marginLeft = "10px";
    myContent.innerHTML = "<h5>Installation Started</h5><p>Installation Log:</p>"+
    "<p id='cmdDisplayer'></p>"+
    "<div class='progress-bar bg-success' role='progressbar' aria-valuenow='25' aria-valuemin='25' aria-valuemax='100' id='installProgress'></div>"+
    "<select name='domainSelect' id='domainSelect'></select>"+
    "<textarea id='sshLog' cols='30' rows='10' disabled></textarea>";   

    sshLogObject = document.getElementById("sshLog");
    var commandDisplayer = document.getElementById("cmdDisplayer");
    domainSelector = document.getElementById("domainSelect");

    domainSelector.style.display = "block";
    domainSelector.onchange = LogSelection;

    connectionInfoObjects = myContentState.pageContentState["RemoteControlObject"].remoteMachines;

    connectionInfoObjects.forEach((remoteObject) => {
        var newOption = document.createElement("option");
        newOption.innerHTML = remoteObject.hostInfo;
        domainSelector.appendChild(newOption);
    });

    workingDomain = connectionInfoObjects[0];

    const uNAME = myContentState.pageContentState["SSHUsername"];
    const password = myContentState.pageContentState["SSHPassword"];
    
    myContentState.ButtonSetState("back", true);
    myContentState.ButtonSetState("next", true);
    myContentState.SetButtonText("Check");
    
    myContentState.pageContentState["SSHConnectionInstances"] = connectionInfoObjects;

    setTimeout(ShellExecutor, 3000);
    commandDisplayer.innerHTML = "%" + 0;
}

var PreLoad = function(contentState)
{
    var pathContainer = document.getElementById("textContainer");
    var ourPaths = pathContainer.children;
    var logText = document.getElementById("logMessage");

    contentState.pageContentState["PathInput"] = new Array();

    for(var i = 0; i < ourPaths.length; i++)
    {
        if(ourPaths[i].value == "")
        {
            logText.style.display = "block";
            return 1;
        }
        contentState.pageContentState["PathInput"].push(ourPaths[i].value);
    }

    if(contentState.pageContentState["DeadMachines"].size != 0)
    {
        let hostText = "Host ";
        let machineSequence = "";

        if(contentState.pageContentState["DeadMachines"].size > 1)
        {
            hostText = "Hosts ";
        }

        for(let hostKey of contentState.pageContentState["DeadMachines"])
        {
            machineSequence += hostKey + "\n";
        }

        const totalErrorMessage = hostText + " unreachable: \n" +
        machineSequence +
        "\n Make sure you have: \n"+
        "- Properly working internet connection. \n" +
        "- Configured host names properly. \n" +
        "- SSH Service Available. \n" +
        "- Allowed SSH Port (22).";

        contentState.pageContentState["DeadMachines"] = new Set();

        const {ipcRenderer} = require("electron");
        ipcRenderer.invoke("pole-error-dialog", "Remote Connection Error", totalErrorMessage);
        return 1;
    }

    return 0;
}

function PromExecuteRecursive()
{
    if(promCounter == sshCommandList.length)
    {
        StartRemoteInstallation();
    }
    else
    {
        promSSHInstance.execCommand(sshCommandList[promCounter]).then(function(cmdResult){
            sshLogObject.value += cmdResult.stdout;
            promCounter++;
            PromExecuteRecursive();
            
        })
    }
}

var OnLoad = function(contentState)
{
    myContentState = contentState;
    sshCommandList = new Array();
    promCounter = 0;

    var myContent = document.getElementById("contentContainer");

    myContent.style.marginLeft = "10px";
    myContent.innerHTML = "<h5>Installation Started</h5><p>Installation Log:</p>"+
    "<p id='cmdDisplayer'></p>"+
    "<select name='domainSelect' id='domainSelect'></select>"+
    "<textarea id='sshLog' cols='30' rows='10' disabled></textarea>";   

    sshLogObject = document.getElementById("sshLog");
    var commandDisplayer = document.getElementById("cmdDisplayer");
    commandDisplayer.innerHTML = "Setting up monitoring tools.";
    domainSelector = document.getElementById("domainSelect");
    domainSelector.style.display = 'none';

    const yamlModule = require("js-yaml");
    totalDomainInputs = myContentState.pageContentState["DomainInputs"]; // ARRAY
    // const givenMasterNode = myContentState.pageContentState["MasterNode"]; // STRING

    const promMaster = totalDomainInputs[totalDomainInputs.length - 1];

    const fs = require('fs');
    const doc = yamlModule.load(fs.readFileSync('./resources/app/prometheus_template.yml', 'utf8'));

    doc.scrape_configs[0].static_configs[0].targets[0] = promMaster + ":9090";
    doc.scrape_configs[3].static_configs[0].targets[0] = myContentState.pageContentState["MasterNode"] + ":27001";

    doc.scrape_configs[1].static_configs[0].targets = new Array();
    doc.scrape_configs[2].static_configs[0].targets = new Array();
    doc.scrape_configs[4].static_configs[0].targets = new Array();

    for(var i = 0; i < totalDomainInputs.length; i++)
    {
        doc.scrape_configs[1].static_configs[0].targets.push(totalDomainInputs[i] + ":9100");
    }

    for(var i = 0; i < totalDomainInputs.length; i++)
    {
        doc.scrape_configs[2].static_configs[0].targets.push(totalDomainInputs[i] + ":8090");
    }

    for(var i = 0; i < totalDomainInputs.length; i++)
    {
        doc.scrape_configs[4].static_configs[0].targets.push(totalDomainInputs[i] + ":27002");
    }
    const lastMachine = contentState.pageContentState["RemoteControlObject"].remoteMachines.length;
    promSSHInstance = contentState.pageContentState["RemoteControlObject"].remoteMachines[lastMachine - 1].selfSsh;
    
    const uNAME = myContentState.pageContentState["SSHUsername"];
    const password = myContentState.pageContentState["SSHPassword"];

    sshCommandList.push("sudo yum -y install wget");
    sshCommandList.push("sudo groupadd --system prometheus");
    sshCommandList.push("sudo useradd -s /sbin/nologin --system -g prometheus prometheus");
    sshCommandList.push("sudo mkdir /var/lib/prometheus");
    sshCommandList.push("sudo mkdir /etc/prometheus");
    sshCommandList.push("sudo curl -LO https://github.com/prometheus/prometheus/releases/download/v2.40.2/prometheus-2.40.2.linux-amd64.tar.gz");
    sshCommandList.push("tar xvf prometheus-2.40.2.linux-amd64.tar.gz");
    sshCommandList.push("sudo cp prometheus-2.40.2.linux-amd64/prometheus /usr/local/bin/");
    sshCommandList.push("sudo cp prometheus-2.40.2.linux-amd64/promtool /usr/local/bin/");
    sshCommandList.push("sudo cp -r prometheus-2.40.2.linux-amd64/console_libraries/ /etc/prometheus/");
    sshCommandList.push("sudo cp -r prometheus-2.40.2.linux-amd64/console_libraries/ /etc/prometheus/");
    sshCommandList.push("sudo cp -r prometheus-2.40.2.linux-amd64/consoles/ /etc/prometheus/");
    sshCommandList.push("sudo cp -r prometheus-2.40.2.linux-amd64/consoles/ /etc/prometheus/");
    sshCommandList.push("cat /etc/prometheus/prometheus.yml");
    sshCommandList.push("sudo chown -R prometheus:prometheus /etc/prometheus");
    sshCommandList.push("sudo chown -R prometheus:prometheus /var/lib/prometheus");
    sshCommandList.push("sudo chown prometheus:prometheus /usr/local/bin/{prometheus,promtool}");
    //sshCommandList.push("sudo /usr/local/bin/prometheus --config.file=/etc/prometheus/prometheus.yml");
    const prometheusCommand = "cat <<EOF | sudo tee /etc/systemd/system/prometheus.service\n"+
    "[Unit]\n"+
    "Description=Prometheus\n"+
    "Documentation=https://prometheus.io/docs/introduction/overview/\n"+
    "Wants=network-online.target\n"+
    "After=network-online.target\n"+
    "\n"+
    "[Service]\n"+
    "Type=simple\n"+
    "User=prometheus\n"+
    "Group=prometheus\n"+
    "ExecReload=/bin/kill -HUP $$MAINPID \n"+
    "ExecStart=/usr/local/bin/prometheus \\\n"+
    "  --config.file=/etc/prometheus/prometheus.yml \\\n"+
    "  --storage.tsdb.path=/var/lib/prometheus \\\n"+
    "  --web.console.templates=/etc/prometheus/consoles \\\n"+
    "  --web.console.libraries=/etc/prometheus/console_libraries \\\n"+
    "  --web.listen-address=0.0.0.0:9090 \\\n"+
    "  --web.external-url=\n"+
    "\n"+
    "SyslogIdentifier=prometheus\n"+
    "Restart=always\n"+
    "\n"+
    "[Install]\n"+
    "WantedBy=multi-user.target\n"+
    "EOF";
    sshCommandList.push(prometheusCommand);
    sshCommandList.push("sudo systemctl daemon-reload");
    sshCommandList.push("sudo systemctl enable --now prometheus");
    sshCommandList.push("sudo systemctl status prometheus");
    sshCommandList.push("sudo firewall-cmd --add-port=9090/tcp --permanent sudo");
    sshCommandList.push("sudo firewall-cmd --reload");
    var longGrafanaCommand = "cat <<EOF | sudo tee /etc/yum.repos.d/grafana.repo\n"+
    " \n"+
    "[grafana]\n"+
    "name=grafana\n"+
    "baseurl=https://packages.grafana.com/oss/rpm\n"+
    "repo_gpgcheck=1\n"+
    "enabled=1\n"+
    "gpgcheck=1\n"+
    "gpgkey=https://packages.grafana.com/gpg.key\n"+
    "sslverify=1\n"+
    "sslcacert=/etc/pki/tls/certs/ca-bundle.crt\n"+
    "EOF\n";
    sshCommandList.push(longGrafanaCommand);
    sshCommandList.push("sudo dnf install grafana -y");
    sshCommandList.push("sudo rpm -qi grafana");
    sshCommandList.push("sudo systemctl enable --now grafana-server.service");
    sshCommandList.push("sudo firewall-cmd --add-port=3000/tcp --permanent");
    sshCommandList.push("sudo firewall-cmd --reload");    


    // var sshConfig = {
    //     host: promMaster,
    //     username: uNAME,
    //     port: 22,
    //     password,
    //     tryKeyboard: false
    // }
    
    fs.writeFileSync("prometheus.yml", yamlModule.dump(doc, {flowLevel: 5}));
    
    promSSHInstance.putFile("./prometheus.yml", "/etc/prometheus/prometheus.yml");

    // promSSHInstance.connect(sshConfig).then(function(){
    //     console.log("connected.");
    //     promSSHInstance.putFile("prometheus.yml", "/etc/prometheus/prometheus.yml");
    // })

    setTimeout(PromExecuteRecursive, 3000);
    myContentState.ButtonSetState("back", true);
    myContentState.ButtonSetState("next", true);
    myContentState.SetButtonText("Check");
    // console.log(yamlModule.dump(doc, {schema: yamlModule.JSON_SCHEMA, flowLevel: 5, forceQuotes: true}));

    // Setting up prometheus yaml

    // Do all the ssh thing
}

var exportFunctions = [PreLoad, OnLoad];

module.exports = exportFunctions;
