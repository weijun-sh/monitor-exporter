const fs = require("fs");
const path = require("path");

let confPath = path.join(__dirname, 'conf.txt');

function createConf(){
    fs.stat(confPath, function (err, stats) {
        if (!stats) {
            fs.writeFileSync(confPath, ""); //Create dir in case not found
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

createConf();
module.exports = {
    readConf
}


