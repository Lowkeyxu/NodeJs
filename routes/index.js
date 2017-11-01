var express = require('express');
var Busboy = require("busboy");
var fs = require('fs');
var path = require('path');
var UUID = require('node-uuid');
var router = express.Router();
var db = require('./mysql.js');

var  userAddSql = 'INSERT INTO sys_user(id,loginName,userName,sex,password,delFlag,addTime,addUserId,addMark,updTime,updUserId,updMark) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)';
var  userAddSql_Params = ['123456', '1', '1', '1', '1', '1', '2017-11-01 18:33:36', '1', '1', '2017-11-01 18:33:36', '1', '1'];

/* GET home page. */
router.get('/', function(req, res, next) {
        console.log('the response will be sent by the next function ...');
        db.dba(userAddSql,userAddSql_Params);
        next();
    }, function (req, res) {
        res.render('index',{title: 'Express' ,xuwc: 'xuwc'});
});


//post 请求
router.post('/postTest', function(req, res) {
    var text1 = req.body.text1;
    var text2 = req.body.text2;
    res.render('xuwc',
        {
            text1: text1 ,
            text2: text2
        }
    );
});

//上传文件
router.post('/file_upload',function(req,res){
    var totalSize = 0;
    var busboy = new Busboy({headers:req.headers});
    busboy.on('file',function(fieldname, file, filename, encoding, mimetype){
        console.log("===================文件上传=======================");
        console.log('File [' + fieldname + ']: filename: ' + filename);
        file.on('data', function(data) {
            if(data.length > 1024*1024){
                console.log('文件 [' + filename + '] 大小为 ' + (data.length/(1024*1024)).toFixed(2) + ' MB');
            }else{
                console.log('文件 [' + filename + '] 大小为 ' + (data.length/1024).toFixed(2) + ' KB');
            }
            totalSize = parseFloat(totalSize) + parseFloat(data.length);
        });
        //后缀名
        var fileExt=(/[.]/.exec(filename)) ? /[^.]+$/.exec(filename.toLowerCase()) : '';
        var fstream =  path.join(path.normalize(__dirname + '/..'),'upload/image', UUID.v1() + "."+fileExt);
        var uploadPath = fstream;
        if(filename !== ""){
            fstream = fs.createWriteStream(fstream);
            file.pipe(fstream);
        }
        fstream.on('end', function() {
            console.log("文件流结束");
        });
        fstream.on('close',function(){
            //console.log("文件流关闭");
            res.writeHead(200, { Connection: 'close'});
            res.
            res.end("upload is ok!!! <image src='"+uploadPath+"' width='300px'; height='350px';/>")
            console.log('===================文件上传成功!===================');
        });
        fstream.on('error', function(err) {
            console.log("文件流出错:" + err);
            file.unpipe();
            fstream.end();
        });
        fstream.on('finish', function() {
            file.pipe(fstream);
        });
        file.on('end', function() {
            var types;
            if(totalSize > 1024*1024){
                types = (totalSize/(1024*1024)).toFixed(2) + " MB";
            }else{
                types = (totalSize/1024).toFixed(2) + " KB";
            }
            console.log('文件 [' + filename + '] 完成 文件总大小为 ' + types);
        });

    });
    // busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    //     console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    // });
    // busboy.on('finish', function() {
    //     console.log('===================文件上传成功!===================');
    //     res.writeHead(200, { Connection: 'close'});
    //     res.end("upload is ok!!!")
    // });
    req.pipe(busboy);
});

module.exports = router;
