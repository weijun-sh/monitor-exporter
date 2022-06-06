const fs = require("fs");
const path = require("path");

let confPath = path.join(__dirname, 'config.txt');

function createConf(){
    fs.stat(confPath, function (err, stats) {
        if (!stats) {
            fs.writeFileSync(confPath, `{"sendEmail" : false,"sendInterval": 1000000,"to": "","subject": "","from": "","auth_pass": "","auth_user": ""}`);
        }
    });
}

function readConf(key){
    try {
        let obj = fs.readFileSync(confPath).toString();
        obj = JSON.parse(obj);
        return obj[key]
    }catch (err){
        return null
    }

}

function readConfigs(){
    try {
        let obj = fs.readFileSync(confPath).toString();
        obj = JSON.parse(obj);
        return obj
    }catch (err){
        console.log("readconfig error", err)
        return {}
    }

}

createConf();
module.exports = {
    readConf,
    readConfigs
}


