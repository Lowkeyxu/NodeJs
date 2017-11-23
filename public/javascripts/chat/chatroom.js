/**
 * Created by xuwc on 2017/11/13.
 */
/*建立socket连接，使用websocket协议，端口号是服务器端监听端口号*/
//  var url = "ws://xuwc.free.ngrok.cc";
// var socket = io(url);
var index=0;
$(function(){
    if(index == 0){
        var id = $("#id").val();
        /*向服务端发送登录事件*/
        socket.emit('login',{"id":id});
        index++;
    }

    /*登录成功*/
    socket.on('loginSuccess',function(data){
        //存入用户名作为匹配
         $("#userName").val(data.userName);
         uname = data.userName;
    });

    /* 在线人数 */
    socket.on('onLineNum',function(data){
        $("#h1title").html("("+data+"人在线)");
    });

    /*登录失败*/
    socket.on('loginFail',function(){
        alert('昵称重复')
    });

    /*新人加入提示*/
    socket.on('add',function(data){
        if(data.userName != uname){
            playSound();
        }
        var html = '<p>系统消息:'+data.userName+'已加入群聊</p>';
        $('.chat-con').append(html);
    });
    /*退出群聊提示*/
    socket.on('leave',function(name){
        if(name != null){
            var html = '<p>系统消息:'+name+'已退出群聊</p>';
            $('.chat-con').append(html);
        }
    });

    /*接收消息*/
    socket.on('receiveMessage',function(data){
        if(data.userName != uname){
            playSound();
        }
        showMessage(data);
    });

    /*接收私聊消息*/
    socket.on('sayToMessage',function(data){
        if(data.from != uname){
            playSound();
        }
        showMessage(data);
    });


    /*发送消息*/
    $('.sendBtn').click(function(){
        sendMessage();
    });

    $(document).keydown(function(event){
        if(event.keyCode == 13){
            sendMessage();
        }
    });

    //发送消息
    function sendMessage(){
        //消息内容
        var txt = $('#sendtxt').val();
        //清空输入框
        $('#sendtxt').val('');
        //用户id
        var id =$("#id").val();
        if(txt){
            socket.emit('sendMessage',{"userName":uname,"userId":id,"message":txt});
        }
    }

    /*显示消息*/
    function showMessage(data){
        var ms = "";
        if(data.to){
            ms = "(来自私聊信息)";
        }
        var timestamp = new Date().getTime();
        var html;
        if(data.userName === uname){
            html = '<div id='+timestamp+' class="chat-item item-right clearfix"><span class="img fr" uid='+data.userId+'></span><span class="message fr">'+data.message+'</span></div>'
        }else{
            html='<div id='+timestamp+' class="chat-item item-left clearfix rela"><span class="abs uname">'+data.userName+ms+' '+data.dateTime+'</span><span class="img fl" uid='+data.userId+'></span><span class="fl message">'+data.message+'</span></div>'
        }
        $('.chat-con').append(html);
        if(data.imgurl != "" && data.imgurl != null){
            $("#"+timestamp).find("span.img").css("background-image",'url("' + data.imgurl + '")');
        }

        //显示到最后的地方
        document.getElementById(timestamp).scrollIntoView();
        // var div = document.getElementsByClassName('chat-con');
        // div.scrollTop = div.scrollHeight;
    }

    //点击头像私聊
    $('.chat-con').on('click','.img', function() {
        //用户id
        var userId = $(this).attr("uid");
        //当前登录用户id
        var id = $("#id").val();
        if(userId != id){
            window.location.href= "/chats/privateChat?fromId="+id+"&toId="+userId;
        }
    });

});
