/**
 * Created by xuwc on 2017/11/6.
 */

var express = require('express');
var session = require('express-session');
var fs = require('fs');
var path = require('path');
var multipart = require('connect-multiparty');
var $common = require('../common/common');
var router = express.Router();

//var service = require('http').createServer(express);
//监听端口
var io = require('socket.io').listen(8081);

var app = express();
app.use(session({
    secret: 'xuwc', // 建议使用 128 个字符的随机字符串
    cookie: { maxAge: 60 * 1000 },
    saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
    resave: false,  // 是否每次都重新保存会话，建议false
}));


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


//上传头像
router.post("/upload",multipart(), function(req, res,next){
    var filename = req.files.files.originalFilename || path.basename(req.files.files.path);
    //后缀名
    var fileExt=(/[.]/.exec(filename)) ? /[^.]+$/.exec(filename.toLowerCase()) : '';
    var dirpath = '../upload/image/'+ $common.uuidTools(req, res, next) + "."+fileExt;
    var uploadPath =  path.join(path.normalize(__dirname + '/..'),'upload/image', $common.uuidTools(req, res, next) + "."+fileExt);
    console.log("图片上传路径:"+uploadPath);
    fs.createReadStream(req.files.files.path).pipe(fs.createWriteStream(uploadPath));
    res.json({code: 200, msg: {src: __dirname}});
});

module.exports = router;
