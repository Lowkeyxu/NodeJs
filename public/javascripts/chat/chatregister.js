/**
 * Created by xuwc on 2017/11/13.
 */

// 将form序列化结果转为json
$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [ o[this.name] ];
            }
            o[this.name].push($.trim(this.value) || '');
        } else {
            o[this.name] = $.trim(this.value) || '';
        }
    });
    return o;
};


$(function(){
    $("#regForm").validate({
        // 定义规则
        rules : {
            loginName:{
                required: true,
                username: true
            },
            password:{
                required: true,
                minlength: 6,
                maxlength: 20,
                isPassWord: true
            },
            confirmpassword:{
                required: true,
                equalTo: "#password"
            },
            userName:{
                required: true,
                userName: true
            }
        },
        // 定义提示信息
        messages : {
            loginName:{
                required: "账号不能为空",
            },
            password:{
                required: "密码不能为空",
                minlength: "密码长度不能少于6",
                maxlength: "密码长度不能大于20",
                isPassWord: "密码必须为字母和数字组成"
            },
            confirmpassword:{
                required: "确认密码不能为空",
                equalTo: "确认密码与密码不一样"
            },
            userName:{
                required: "用户名不能为空",
            }
        },
        success : function(element) {
            element.remove();
            $('#popup').hide();
        },
        errorPlacement : function(error, element) {
            var msg = error.html();
            $('#popup').show();
            if(element.attr("class") == "form-control error"){
                $("#popup-content").html(msg);
            }
        },
        submitHandler : function(form) {
            register();
        }
    });

    //验证密码格式
    jQuery.validator.addMethod("isPassWord", function (value, element) {
        return this.optional(element) || /^(?![0-9]+$)[0-9A-Za-z]{6,20}$/.test(value);
    },"必须为6~20位字母和数字组成");


    //注册
    $("#register").click(doSave);

    $(".close").click(function(){
        $(this).parent().hide();
    });
});


function doSave(){
    $("#regForm").submit();
    return false;
};
//注册
function register(){
    var postData = $("#regForm").serializeObject();
    var photoImage = $("#photoImage").val();
    $.ajax({
        url: '/chats/saveRegister',
        type: 'POST',
        data: $.extend(postData, {"photoImage":photoImage}),
        async: false,
        dataType: "json",
        success: function(data){
            if(10000 === data.code) {
                window.location.href= "/chats/login";
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
                $("#photoImage").val(data.msg.src);
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
