/**
 * Created by xuwc on 2017/11/2.
 * 数据库连接配置
 */
var mysql = require('mysql');
var db = null;
module.exports = {
    mysql : {
        host     : '127.0.0.1',
        user     : 'root',
        password : 'root',
        port: '3306',
        database: 'ssmtest'
    },
    init:function(){
        if (db === null) {
            handleDisconnect();
        }
        return db;
    }
};

//短线重连
var connection;
function handleDisconnect() {
    connection = mysql.createConnection(module.exports.mysql);
    connection.connect(function(err) {
        if(err) {
            console.log("进行断线重连：" + new Date());
            setTimeout(handleDisconnect, 2000);   //2秒重连一次
            return;
        }
        console.log("["+module.exports.mysql.database+"] 数据库连接成功");
    });
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();