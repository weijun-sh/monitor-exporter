const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const {readDisk, connectMongo, closeConnect} = require('./mongodb');

const Port = 10010
connectMongo().then(() => {
    console.log("连接mongo 成功");
}).catch((err) => {
    console.log("连接mongo 失败", err);
})

const diskPath = path.join(__dirname, "./metrics.txt");
const errorPath = path.join(__dirname, "./error.txt");

//初始化 清空文件数据
fs.writeFileSync(diskPath, "")


async function readMetrics() {
    return new Promise((resolve, reject) => {
        let metrics = '';
        readDisk().then((list) => {
            list.map((item) => {
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

                let params = `{${path}, ${node}, ${mounted}}`;
                let blocks =     `sv_disk_blocks    ${params} ${total}\n`;
                let used =       `sv_disk_used      ${params} ${usedValue}\n`;
                let available =  `sv_disk_available ${params} ${availableValue}\n`;
                let percent =    `sv_disk_percent   ${params} ${percentValue}\n\n`;
                let note = `# 服务器: ${fullnode} 路径: ${disk} ， 挂载: ${Mounted} \n\n`
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

app.get("/close", async (req, res) => {


    res.send("已经成功关闭");
    closeConnect();
    process.exit(0);
});

//3.调用app.listen()函数启动服务器
app.listen(Port, () => {
    console.log(`running at http://127.0.0.1:${Port}`);
});
