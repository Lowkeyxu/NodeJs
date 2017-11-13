/**
 * Created by xuwc on 2017/11/13.
 */
$(function(){
    /*建立socket连接，使用websocket协议，端口号是服务器端监听端口号*/
    //  var url = "ws://xuwc.free.ngrok.cc";
    // var socket = io(url);
    var socket = io('ws://localhost:8081');
    /*定义用户名*/
    var uname = null;
    /*登录*/
    $('.login-btn').click(function(){
        uname = $.trim($('#loginName').val());
        var imgurl = $("#userPhoto").attr("src");
        if(uname){
            /*向服务端发送登录事件*/
            socket.emit('login',{"username":uname,"imgurl":imgurl})
        }else{
            alert('请输入昵称');
        }
    });

    $("#login").click(login);

    /*登录成功*/
    socket.on('loginSuccess',function(data){
        if(data.username === uname){
            checkin(data)
        }else{
            alert('用户名不匹配，请重试')
        }
    });

    /*登录失败*/
    socket.on('loginFail',function(){
        alert('昵称重复')
    });

    /*新人加入提示*/
    socket.on('add',function(data){
        if(data.username != uname){
            playSound();
        }
        var html = '<p>系统消息:'+data.username+'已加入群聊</p>';
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
        if(data.username != uname){
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
        if(txt){
            socket.emit('sendMessage',{username:uname,message:txt});
        }
    }

    /*显示消息*/
    function showMessage(data){
        var timestamp = new Date().getTime();
        var html;
        if(data.username === uname){
            html = '<div id='+timestamp+' class="chat-item item-right clearfix"><span class="img fr"></span><span class="message fr">'+data.message+'</span></div>'
        }else{
            html='<div id='+timestamp+' class="chat-item item-left clearfix rela"><span class="abs uname">'+data.username+'</span><span class="img fl"></span><span class="fl message">'+data.message+'</span></div>'
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

    $(".close").click(function(){
        $(this).parent().hide();
    });

});

document.onkeydown = keyDownSearch;

function keyDownSearch(e) {
    // 兼容FF和IE和Opera
    var theEvent = e || window.event;
    var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
    if (code == 13) {
        login();// 具体处理函数
        return false;
    }
    return true;
}

//登录
function login() {
    //清空错误消息
    $("#popup-content").html("");
    //登录名
    var loginName = $("#loginName").val();
    //密码
    var password = $("#password").val();
    if(loginName == ""){
        $("#popup").show();
        $("#popup-content").html('请输入账号');
        return;
    }
    if(password == ""){
        $("#popup").show();
        $("#popup-content").html('请输入密码');
        return;
    }
    $.ajax({
        url: '/chats/toLogin',
        type: 'POST',
        data: {"loginName":loginName,"password":password},
        async: false,
        dataType: "json",
        success: function(data){
            if(10000 === data.code) {
                window.location.href= "/chats/index";
            } else {
                $("#popup").show();
                $("#popup-content").html(data.msg);
            }
        },
        error: function(){
            alert("与服务器通信发生错误");
        }
    });
}

/*隐藏登录界面 显示聊天界面*/
function checkin(data){
    $('.login-wrap').hide('slow');
    $('.chat-wrap').show('slow');
}


//上传图片
function uploadFile(){
    $('#activity_pane').showLoading();
    var formData = new FormData($("#frmUploadFile")[0]);
    $.ajax({
        url: '/chats/upload',
        type: 'POST',
        data: formData,
        async: false,
        cache: false,
        contentType: false,
        processData: false,
        success: function(data){
            if(200 === data.code) {
                $("#userPhoto").show();
                $("#frmUploadFile").hide();
                $("#userPhoto").attr('src', data.msg.src);
                $("#imgurl").val(data.msg.src);
            } else {
                alert("上传失败");
            }
            $('#activity_pane').hideLoading();
        },
        error: function(){
            alert("与服务器通信发生错误");
            $('#activity_pane').hideLoading();
        }
    });
}

//播放音频
function playSound(){
    var borswer = window.navigator.userAgent.toLowerCase();
    if ( borswer.indexOf( "ie" ) >= 0 ){
        //IE内核浏览器
        var strEmbed = '<embed name="embedPlay" src="/music/4083.wav" autostart="true" hidden="true" loop="false"></embed>';
        if ( $( "body" ).find( "embed" ).length <= 0 )
            $( "body" ).append( strEmbed );
        var embed = document.embedPlay;

        //浏览器不支持 audion，则使用 embed 播放
        embed.volume = 100;
        //embed.play();这个不需要
    } else{
        //非IE内核浏览器
        var strAudio = "<audio id='audioPlay' src='/music/4083.wav' hidden='true'>";
        if ( $( "body" ).find( "audio" ).length <= 0 )
            $( "body" ).append( strAudio );
        var audio = document.getElementById( "audioPlay" );

        //浏览器支持 audion
        audio.play();
        // 解决iOS禁止自动播放音频
        // 微信自动播放音频
        document.addEventListener("WeixinJSBridgeReady",function () {
            //audio.play();
        }, false);
        // 其他应用在click/touch时触发播放
        document.addEventListener('click', function () {
            //audio.play()
        });
        //触摸触发事件
        document.addEventListener('touchstart', function () {
            //audio.play()
        });
    }
}


