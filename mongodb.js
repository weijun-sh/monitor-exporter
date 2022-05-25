var MongoClient = require('mongodb').MongoClient;

const host = '112.74.110.203';
const port = '20525';
const address = `${host}:${port}`;
const dbName = 'fullnode';
const tableName = 'disk';
const username = 'rReadonly';
const password = 'r_20220525OH'

const authLink = `mongodb://${username}:${password}@${address}/${dbName}`

let _database = null;

const DiskField = {
    fullnode: 'fullnode',
    disk: 'disk',
    Total: 'Total',
    Used: 'Used',
    Avaliable: 'Avaliable',
    Use: 'Use',
    Mounted: 'Mounted',
    timestamp: 'timestamp'

}

function connectMongo(){
    return new Promise((resolve, reject) => {
        MongoClient.connect(authLink, function(err, db) {
            if (err) {

                reject && reject();
                return;
            }
            _database = db;
            resolve && resolve();
        });
    })

}

function readDisk(){
    return new Promise((resolve, reject) => {
        if(!_database){
            reject("mongoError notConnected")
            return;
        }
        const dbo = _database.db(dbName);
        dbo.collection(tableName). find({}).toArray(function(err, result) { // 返回集合中所有数据
            if (err) {
                reject && reject(`mongoError readFail_${err.toString()}`)
                return
            }
            console.log(result);
            resolve && resolve(result)

        });
    })

}

function closeConnect(){
    _database.close().then((() => {})).catch(() => {});
}


module.exports = {
    readDisk,
    connectMongo,
    closeConnect
}


