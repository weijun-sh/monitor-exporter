const express = require("express");
const app = express();
const path = require("path");
/*const bodyParser = require("body-parser");
const fs = require("fs");
const ejs = require("ejs");
const {readConf} = require("./resolveConf");
const {readDiskMetrics, readDiskOrg} = require('./disk')
const {connectMongo, closeConnect} = require('./mongodb');
const {readSummaryHtml, sendSummaryEmail} = require('./sumarry');
const viewsPath = path.join(__dirname, 'views');*/

/*app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.set('views', viewsPath);
app.set('view engine', 'ejs');*/


/*
connectMongo().then(() => {
    console.log("连接mongo 成功");
}).catch((err) => {
    console.log("连接mongo 失败", err);
})
*/

const diskPath = path.join(__dirname, "./metrics.txt");
const errorPath = path.join(__dirname, "./error.txt");

//初始化 清空文件数据
//fs.writeFileSync(diskPath, "")


app.get("/", (req, res) => {
    res.send(`
        <ol>
            <li>Metrics <a href='/metrics'>/metrics</a></li>
            <li>Summary <a href='/summary'>/summary</a></li>
            <li>DiskOrg <a href='/diskOrg'>/diskOrg</a></li>
            <li>sendSummaryEmail <a href='/sendSummaryEmail'>/sendSummaryEmail</a></li>
        </ol>`);
});


app.get("/metrics", async (req, res) => {
    res.sendFile(diskPath)
    return;
    /*    fs.writeFileSync(diskPath, "");
        readDiskMetrics().then((metrics) => {
            fs.writeFileSync(diskPath, `${metrics}`);
            res.sendFile(diskPath)
        }).catch((err) => {
            fs.writeFileSync(diskPath, err);
            res.sendFile(errorPath)
        });*/
});

/*
app.get("/diskOrg", async (req, res) => {
    readDiskOrg().then((list) => {
        res.send(list)
    }).catch((err) => {
        res.send({
            code: 1,
            msg: 'error',
        })
    })
});
*/


/*app.get("/summary", function (req, res) {
    readSummaryHtml().then((html) => {
        res.send(html);
    }).catch(() => {
        res.send({
            code: 1,
            data: {},
            msg: 'fail'
        })
    })
});
app.get("/sendSummaryEmail", function (req, res) {
    sendSummaryEmail().then(() => {
        res.send("发送成功")
    }).catch((err) => {
        res.send("邮件 发送失败");
        console.log("邮件 发送失败 ==>", err);
    });
});*/

/*process.on('exit', function (){
    closeConnect();
    console.log("释放资源")
})*/

//3.调用app.listen()函数启动服务器
app.listen(9091, () => {
    console.log(`running at http://127.0.0.1:9091`);
});
