var ejs = require('ejs');
var path = require('path');
let nodemailer = require("nodemailer");
const {readDiskSummary} = require("./disk");
const {readConf, readConfigs} = require("./resolveConf");

let transporter = nodemailer.createTransport({
    host: 'smtp.163.com:465',
    service: "163", //邮箱类型 例如service:'163'
    secure: true, //是否使用安全连接，对https协议的
    port: 465, //qq邮件服务所占用的端口
    auth: {
        user: readConf("auth_user"),//开启SMTP的邮箱，发件人
        pass: readConf("auth_pass")// qq授权码
    }
})

function getOptions(obj){
    let options = {};
    let configs = readConfigs();
    console.log("configs ==>", configs)
    options.subject = configs.subject;
    options.to = configs.to;
    options.from = configs.from;

    for(let key in obj){
        options[key] = obj[key]
    }

    return options

}


function sendSummaryEmail() {
    return readSummaryHtml().then((html) => {
        let data = transporter.sendMail(getOptions({html}), (err, info) => {
            if (err) {
                console.log("发送失败")
            } else {
                console.log("发送成功")
            }
        })
    }).catch((err) => {
        let data = transporter.sendMail(getOptions({html:"服务器监控读取失败"}), (err, info) => {
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

                resolve(html)
            });
        }).catch(() => {

        })
    })

}

(function sendFn(time){
    setTimeout(() => {
        console.log("time out ==>", time)
        if(readConf("sendEmail")){

            sendSummaryEmail().then(() => {
                console.log("发送成功");
            }).catch(() => {
                console.log("发送失败");
            });

            sendFn(readConf("sendInterval"))
        }

    }, time);
})(readConf("sendInterval"))

module.exports = {
    readSummaryHtml,
    sendSummaryEmail,
};

