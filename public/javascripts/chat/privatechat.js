/**
 * Created by xuwc on 2017/11/22.
 */
$(function(){
    /*退出私聊提示*/
    socket.on('offline',function(name){
        if(name != null){
            var html = '<p>系统消息:'+name+'已退出私聊</p>';
            $('.chat-con').append(html);
        }
    });

    /*接收群聊消息*/
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
        var ms = "(来自群聊信息)";
        if(data.to){
            ms = "";
        }
        var timestamp = new Date().getTime();
        var html;
        if(data.userName === uname){
            html = '<div id='+timestamp+' class="chat-item item-right clearfix"><span class="img fr"></span><span class="message fr">'+data.message+'</span></div>'
        }else{
            html='<div id='+timestamp+' class="chat-item item-left clearfix rela"><span class="abs uname">'+data.userName+ms+' '+data.dateTime+'</span><span class="img fl"></span><span class="fl message">'+data.message+'</span></div>'
        }
        $('.chat-con').append(html);
        if(data.imgurl != "" && data.imgurl != null){
            $("#"+timestamp).find("span.img").css("background-image",'url("' + data.imgurl + '")');
        }

        //显示到最后的地方
        document.getElementById(timestamp).scrollIntoView();
    }

});




