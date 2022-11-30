for(var i = 0; i < inputDomains.length; i++)
{
  const ssh = new NodeSSH();
  var myConfig = {host : inputDomains[domainCounter],  username: 'root',port: 22,password,tryKeyboard: true};
  // ssh.connect({
  //   host: inputDomains[domainCounter],
  //   //host:'centos1', is not working Windows now.
  //   username: 'root',
  //   port: 22,
  //   password,
  //   tryKeyboard: true,
  // })
  ssh.connect(myConfig)
  .then(function(){
      
      sshLog.value += "Connected Host(" + myConfig.host +')\n';
  })          .then(function() {
    ssh.putFile('installer.sh', '/home/centos/poleposition/installer.sh').then(function() {
        sshLog.value += "File thing is done 1 For host " + myConfig.host + '\n';
        
    }, function(error) {
        sshLog.value += 'File error('+ myConfig.host +'): ' + error + '\n';
}).then(function(){
    ssh.execCommand('chmod +x ./installer.sh',{ cwd:'/home/centos/poleposition'}).then(function()
    {
      sshLog.value += "File thing is done 2 For host(" + myConfig.host + ')\n';

    }, function(error) {
      sshLog.value += 'File error('+ myConfig.host +'): ' + error + '\n';
    })
}).then(function(){
    ssh.execCommand('sudo ./installer.sh', { cwd:'/home/centos/poleposition' }).then(function(result) {
        sshLog.value += 'STDOUT(' + myConfig.host + '): ' + result.stdout + '\n';
        sshLog.value += 'STDERR(' + myConfig.host + '): ' + result.stderr + '\n';
      })
})
})

  domainCounter++;
}