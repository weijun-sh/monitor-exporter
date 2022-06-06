var ejs = require('ejs');
var path = require('path');
let nodemailer = require("nodemailer");
const {readDiskSummary} = require("./disk");

let transporter = nodemailer.createTransport({
    host: 'smtp.163.com:465',
    service: "163", //邮箱类型 例如service:'163'
    secure: true, //是否使用安全连接，对https协议的
    port: 465, //qq邮件服务所占用的端口
    auth: {
        user: "multichainmonitor@163.com",//开启SMTP的邮箱，发件人
        pass: "YQRJZAEQBXJFKKZP"// qq授权码
    }
})

let options = {};
options.from = 'multichainmonitor@163.com'; //发送方
options.to = "747954470@qq.com";//接收方
options.subject = '服务器监控概况';//邮件主题


function sendSummaryEmail() {
    return readSummaryHtml().then((html) => {
        options.html = html;
        let data = transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log("发送失败")
            } else {
                console.log("发送成功")
            }
        })
    }).catch((err) => {
        options.subject = "服务器监控读取失败";
        let data = transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log("发送失败")
            } else {
                console.log("发送成功")
            }
        })
    })
}

function readSummaryHtml() {
    return new Promise((resolve, reject) => {
        readDiskSummary().then((list) => {
            let arr = [];
            for (let key in list) {
                //用for循环转换resObj对象
                arr.push({
                    node: key,
                    time: list[key][0].time,
                    disks: list[key]
                });
            }
            const tempPath = path.join(__dirname, 'views', 'summary.ejs')
            ejs.renderFile(tempPath, {
                list: arr
            }, {}, function (err, html) {
                if (err) {
                    reject(err)
                    return;
                }
                options.html = html;

                resolve(html)
            });
        }).catch(() => {

        })
    })

}

module.exports = {
    readSummaryHtml,
    sendSummaryEmail,
};

