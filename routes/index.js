var express = require('express');
var Busboy = require("busboy");
var fs = require('fs');
var path = require('path');
var sd = require('silly-datetime');
var $common = require('../common/common');
//用户dao
var userDao = require('../dao/userDao');
var router = express.Router();

//var service = require('http').createServer(express);
//监听端口
var io = require('socket.io').listen(8081);

/*定义用户数组*/
var users = [];
/**
 *监听客户端连接
 *io是我们定义的服务端的socket
 *回调函数里面的socket是本次连接的客户端socket
 *io与socket是一对多的关系
 */
io.on('connection', function (socket) {
    /*所有的监听on，与发送emit都得写在连接里面，包括断开连接*/

    /*是否是新用户标识*/
    var isNewPerson = true;
    /*当前登录用户*/
    var username = null;
    /*监听登录*/
    socket.on('login',function(data){
        for(var i=0;i<users.length;i++){
            if(users[i].username === data.username){
                isNewPerson = false;
                break;
            }else{
                isNewPerson = true
            }
        }
        if(isNewPerson){
            username = data.username;
            users.push({
                username:data.username
            });
            /*登录成功*/
            console.log("用户【"+data.username +"】进入房间");
            socket.emit('loginSuccess',data);
            /*向所有连接的客户端广播add事件*/
            io.sockets.emit('add',data)
        }else{
            /*登录失败*/
            socket.emit('loginFail','')
        }
    });
    //退出登录
    socket.on('disconnect',function(){
        /*向所有连接的客户端广播leave事件*/
        console.log("用户【"+username +"】离开房间");
        io.sockets.emit('leave',username);
        users.map(function(val,index){
            if(val.username === username){
                users.splice(index,1);
            }
        });
    });
    //发送消息
    socket.on('sendMessage',function(data){
        console.log("【"+data.username + "】 发送消息："+data.message);
        io.sockets.emit('receiveMessage',data)
    })
});

//进入聊天室
router.get('/login', function(req, res, next) {
    res.render('chat');
});

/* GET home page. */
router.get('/', function(req, res, next) {
    //查询列表数据
    userDao.queryAll(req, res,function (data) {
        res.render('index',{title: 'Express' ,xuwc: 'xuwc',userList:data});
    });
    // var data = JSON.stringify(data);
    // res.render('index',{title: 'Express' ,xuwc: 'xuwc','userList':data});
});

// 增加用户
router.get('/addUser', function(req, res, next) {
    res.render('userAdd');
});

router.get('/queryAll', function(req, res, next) {
    userDao.queryAll(req, res, next);
});

router.get('/query', function(req, res, next) {
    userDao.queryById(req, res, next);
});

router.get('/deleteUser', function(req, res, next) {
    userDao.delete(req, res, function(data){
        if(data.code === 10000){
            res.redirect('/');
        }
    });
});

//更新用户页面
router.get('/updateUser', function(req, res, next) {
    //查询列表数据
    userDao.queryById(req, res,function (data) {
        res.render('userEdit',{userInfo: data});
    });
    //userDao.update(req, res, next);
});

//保存用户页面
router.get('/saveUser', function(req, res, next) {
    if(req.query.id === undefined){
        //添加
        req.query.id = $common.uuidTools(req, res, next);
        req.query.addTime = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
        req.query.addUserId = 'sys';
        req.query.addMark = 'add';
        userDao.add(req, res,function(data){
            if(data.code === 10000){
                res.redirect('/');
            }
        });
    }else{
        //更新
        userDao.update(req, res,function(data){
            if(data.affectedRows > 0){
                res.redirect('/');
            }
        });
    }
    //userDao.update(req, res, next);
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
router.post('/file_upload',function(req, res, next){
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
        var fstream =  path.join(path.normalize(__dirname + '/..'),'upload/image', $common.uuidTools(req, res, next) + "."+fileExt);
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
