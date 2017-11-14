/**
 * Created by xuwc on 2017/11/3.
 */
$(function(){
    $("#login").click(login);
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
                window.location.href= "/chats/index?id="+data.data.id;
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

