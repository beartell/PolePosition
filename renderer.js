const fs = require('fs');
const POLEVIEWER = require('./PageViewer');
var fileCont = fs.readFileSync("./resources/app/pole_config.json", 'utf-8');

var pageViewerInstance = new POLEVIEWER(fileCont, "contentPart", "nextButton", "backButton");