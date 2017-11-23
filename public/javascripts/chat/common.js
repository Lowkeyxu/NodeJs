/**
 * Created by xuwc on 2017/11/23.
 */
/*建立socket连接，使用websocket协议，端口号是服务器端监听端口号*/
var socket = io('ws://localhost:8081');
/*定义用户名*/
var uname = null;;
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