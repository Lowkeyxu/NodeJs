/**
 * Created by xuwc on 2017/11/22.
 */
/*建立socket连接，使用websocket协议，端口号是服务器端监听端口号*/
var socket = io('ws://localhost:8081');
var uname;
$(function(){

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
        var from = $('#from').val();
        var to = $('#to').val();
        var fromId = $('#fromId').val();
        var toId = $('#toId').val();
        //清空输入框
        $('#sendtxt').val('');
        if(txt){
            uname = from;
            socket.emit('sayTo',{"from": from,"to": to,"fromId":fromId,"toId":toId,"message": txt});
        }
    }

    /*显示消息*/
    function showMessage(data){
        var timestamp = new Date().getTime();
        var html;
        if(data.userName === uname){
            html = '<div id='+timestamp+' class="chat-item item-right clearfix"><span class="img fr"></span><span class="message fr">'+data.message+'</span></div>'
        }else{
            html='<div id='+timestamp+' class="chat-item item-left clearfix rela"><span class="abs uname">'+data.userName+'</span><span class="img fl"></span><span class="fl message">'+data.message+'</span></div>'
        }
        $('.chat-con').append(html);
        if(data.imgurl != "" && data.imgurl != null){
            $("#"+timestamp).find("span.img").css("background-image",'url("' + data.imgurl + '")');
        }

        //显示到最后的地方
        document.getElementById(timestamp).scrollIntoView();
    }

});

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


