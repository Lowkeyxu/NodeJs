/**
 * Created by xuwc on 2017/11/6.
 */

var express = require('express');
var session = require('express-session');
var sd = require('silly-datetime');
var fs = require('fs');
var path = require('path');
var multipart = require('connect-multiparty');
var $common = require('../common/common');
//用户dao
var userDao = require('../dao/userDao');
var router = express.Router();
var app = express();


//var service = require('http').createServer(express);
//监听端口
var io = require('socket.io').listen(8081);

/*定义用户数组*/
var users = [];
var map = new Map();
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
        var id = data.id;
        if(id !== null && id !== undefined){
            //查询用户信息
            userDao.queryUserInfo(id,function(data){
                var user = data[0];
                for(var i=0;i<users.length;i++){
                    if(users[i].userName === user.userName){
                        isNewPerson = false;
                        break;
                    }else{
                        isNewPerson = true
                    }
                }
                if(isNewPerson){
                    username = user.userName;
                    users.push({
                        userName:user.userName
                    });
                    map.set(username,user.photoImage);
                    /*登录成功*/
                    console.log("用户【"+user.userName +"】 "+sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')+" 进入房间 ");
                    socket.emit('loginSuccess',user);
                    /*向所有连接的客户端广播add事件*/
                    io.sockets.emit('add',user)
                }else{
                    /*登录失败*/
                    socket.emit('loginFail','')
                }
            });
        }
    });
    //退出登录
    socket.on('disconnect',function(){
        /*向所有连接的客户端广播leave事件*/
        console.log("用户【"+username +"】"+sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')+" 离开房间 ");
        io.sockets.emit('leave',username);
        users.map(function(val,index){
            if(val.userName === username){
                users.splice(index,1);
            }
        });
    });
    //发送消息
    socket.on('sendMessage',function(data){
        data.imgurl = map.get(data.userName);
        console.log("【"+data.userName + "】"+sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')+" 发送消息："+data.message);
        io.sockets.emit('receiveMessage',data)
    })
});

//进入登录
router.get('/login', function(req, res, next) {
    if(req.session.user){
        res.render('chatroom');
    }else{
        res.render('chatlogin');
    }
});

//进入登录
router.get('/register', function(req, res, next) {
    res.render('chatregister');
});

//注册信息保存
router.post("/saveRegister",function(req,res,next){
    userDao.saveRegister(req, res,function(data){
        if(data) {
            $common.jsonWrite(res, {code:10000,msg: '注册成功!'});
        }else{
            $common.jsonWrite(res, {code:10001,msg: '注册失败!'});
        }
    });
});

//登录
router.post("/toLogin",function(req,res,next){
    //登录账号
    var loginName = req.body.loginName;
    //密码
    var password = req.body.password;
    if(loginName === "" || password === ""){
        res.json({code: 10000, msg: "登录名或密码不能为空！"});
    }else{
        userDao.queryUser(req, res,function (data) {
            if(data != null && data.length > 0){
                req.session.user = data[0];
                $common.jsonWrite(res, {code:10000,msg: '登录成功!',data:data[0]});
            }else{
                $common.jsonWrite(res, {code:10001,msg: '账号或密码不正确!'});
            }
        });
    }
});
//首页
router.get("/index",function(req,res,next){
    //用户id
    var id = req.query.id;
    res.render('chatroom',{id: id});
});


//上传头像
router.post("/upload",multipart(), function(req, res,next){
    var uuid = $common.uuidTools(req, res, next);
    var filename = req.files.files.originalFilename || path.basename(req.files.files.path);
    //后缀名
    var fileExt=(/[.]/.exec(filename)) ? /[^.]+$/.exec(filename.toLowerCase()) : '';
    var dirpath = '/image/'+ uuid + "."+fileExt;
    var uploadPath =  path.join(path.normalize(__dirname + '/..'),'upload/image', uuid + "."+fileExt);
    console.log("图片上传路径:"+uploadPath);
    console.log("图片上传相对路径:"+dirpath);
    fs.createReadStream(req.files.files.path).pipe(fs.createWriteStream(uploadPath));
    res.json({code: 200, msg: {src: dirpath}});
});

module.exports = router;
