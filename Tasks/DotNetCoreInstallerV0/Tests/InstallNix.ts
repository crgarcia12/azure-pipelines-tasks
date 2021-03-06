import ma = require('vsts-task-lib/mock-answer');
import tmrm = require('vsts-task-lib/mock-run');
import path = require('path');
import os = require('os');

let taskPath = path.join(__dirname, '..', 'dotnetcoreinstaller.js');
let tr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tr.setInput("packageType", process.env["__package_type__"] || 'sdk');
tr.setInput("version", "1.0.4");

process.env["AGENT_TOOLSDIRECTORY"] = "/agent/_tools";
process.env["AGENT_TEMPDIRECTORY"] = "/agent/_temp";

let a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    "exec": {
        "/somedir/currdir/externals/get-os-distro.sh": {
            "code": 0,
            "stdout": "Primary: linux" + os.EOL,
        }
    },
    "osType": {
        "osType": "Linux"
    },
    "which": {
        "/somedir/currdir/externals/get-os-distro.sh": "/somedir/currdir/externals/get-os-distro.sh"
    },
    "checkPath": {
        "/somedir/currdir/externals/get-os-distro.sh": true
    }
};

tr.registerMock('./utilities', {
    getCurrentDir: function () {
        return "/somedir/currdir";
    },
    setFileAttribute: function (file, mode) {
        console.log("Changing attribute for file " + file + " to " + mode);
    }
});

process.env["MOCK_NORMALIZE_SLASHES"] = "true";
tr.setAnswers(a);

tr.registerMock('vsts-task-lib/toolrunner', require('vsts-task-lib/mock-toolrunner'));
tr.registerMock('vsts-task-tool-lib/tool', require('./mock_node_modules/tool'));
tr.registerMock('./releasesfetcher', require("./mock_node_modules/releasesfetcher"));
tr.run();