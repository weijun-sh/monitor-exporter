const fs = require("fs");
const path = require("path");
const {readMongo} = require('./mongodb');
const diskTableName = 'disk';

function getLocalTime(nS) {
    return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');
}

const diskPath = path.join(__dirname, "./metrics.txt");

//初始化 清空文件数据
fs.writeFileSync(diskPath, "")

function filterDisk(org){
    let list = [];
    let history = {}
    org.map((item) => {
        const {fullnode, disk, Mounted} = item;
        let key = `${fullnode}_${disk}_${Mounted}`;
        if(!history[key]){
            list.push(item);
        }
        history[key] = key;
    });
    list = list.sort(function (a, b){
        a = a.fullnode.replace(/[^\d]/g, "");
        b = b.fullnode.replace(/[^\d]/g, "");
        return parseInt(a) - parseInt(b);
    })
    return list;
}

async function readDiskMetrics() {
    return new Promise((resolve, reject) => {
        let metrics = '';
        readMongo(diskTableName).then((list) => {
            filterDisk(list).map((item, index) => {
                const {
                    fullnode,
                    disk,
                    Total,
                    Used,
                    Avaliable,
                    Use,
                    Mounted,
                    timestamp
                } = item;
                const path =     `path="${disk}"`;
                const node =     `node="${fullnode}"`;
                const mounted =  `mounted="${Mounted}"`;
                const total = parseFloat(Total);
                const usedValue =  parseFloat(Used);
                const availableValue = parseFloat(Avaliable)
                const percentValue = parseFloat(Use)
                let time = getLocalTime(timestamp)

                let params = `{${path}, ${node}, ${mounted}}`;
                let blocks =     `sv_disk_blocks    ${params} ${total}\n`;
                let used =       `sv_disk_used      ${params} ${usedValue}\n`;
                let available =  `sv_disk_available ${params} ${availableValue}\n`;
                let percent =    `sv_disk_percent   ${params} ${percentValue}\n\n`;

                let note = `# ${index} ${time} 服务器: ${fullnode} 路径: ${disk} ， 挂载: ${Mounted} \n\n`

                let m = `${note}${blocks}${used}${available}${percent}`;

                metrics += m;
            })
            resolve && resolve(metrics);
        }).catch((err) => {
            reject(err)
        })
    })
}

function readDiskSummary() {
    return new Promise((resolve, reject) => {
        let summarys = {};
        readMongo(diskTableName).then((list) => {
            filterDisk(list).map((item, index) => {
                const {
                    fullnode,
                    disk,
                    Total,
                    Used,
                    Avaliable,
                    Use,
                    Mounted,
                    timestamp
                } = item;
                const total = parseFloat(Total);
                const usedValue =  parseFloat(Used);
                const availableValue = parseFloat(Avaliable)
                const percentValue = parseFloat(Use)
                let time = getLocalTime(timestamp)

                let sub = {
                    blocks: total,
                    used: usedValue,
                    available: availableValue,
                    percent: percentValue,
                    time: time,
                    path: disk,
                    mounted: Mounted,
                    total: total
                }
                if(summarys[fullnode]){
                    summarys[fullnode].push(sub)
                }else{
                    summarys[fullnode] = [];
                    summarys[fullnode].push(sub)
                }

            })

            resolve && resolve(summarys);
        }).catch((err) => {
            reject(err)
        })
    })
}

function readDiskOrg(){
    return readMongo(diskTableName);
}


module.exports = {
    readDiskMetrics,
    readDiskSummary,
    readDiskOrg
}
