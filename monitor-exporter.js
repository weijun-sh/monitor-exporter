const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const {readMongo, connectMongo, closeConnect} = require('./mongodb');
const diskTableName = 'disk';
const Port = 10010;

const viewsPath = path.join(__dirname, 'views');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.set('views', viewsPath);
app.set('view engine', 'ejs');

connectMongo().then(() => {
    console.log("连接mongo 成功");
}).catch((err) => {
    console.log("连接mongo 失败", err);
})

function getLocalTime(nS) {
    return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');
}

const diskPath = path.join(__dirname, "./metrics.txt");
const errorPath = path.join(__dirname, "./error.txt");

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

async function readMetrics() {
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

app.get("/", (req, res) => {
    res.send("hello to monitor exporter <a href='/metrics'>/metrics</a>");
});


app.get("/metrics", async (req, res) => {
    fs.writeFileSync(diskPath, "");
    readMetrics().then((metrics) => {
        fs.writeFileSync(diskPath, `${metrics}`);
        res.sendFile(diskPath)
    }).catch((err) => {
        fs.writeFileSync(diskPath, err);
        res.sendFile(errorPath)
    });
});

app.get("/disk", async (req, res) => {
    readMongo(diskTableName).then((list) => {
        console.log("list ==>", list);
        res.send(list)
    }).catch((err) => {
        res.send({
            code: 1,
            msg: 'error',
        })
    })
});

app.get("/close", async (req, res) => {


    res.send("已经成功关闭");
    closeConnect();
    process.exit(0);
});

app.get('/webview/9090', function (req, res){
    res.render('webview',{
        url: "http://localhost:9090"
    })
})
app.get('/webview/9093', function (req, res){
    res.render('webview',{
        url: "http://localhost:9093"
    })
})

//3.调用app.listen()函数启动服务器
app.listen(Port, () => {
    console.log(`running at http://127.0.0.1:${Port}`);
});
