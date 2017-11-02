/**
 * Created by xuwc on 2017/11/2.
 */
var UUID = require('node-uuid');

module.exports = {
    // 向前台返回JSON方法的简单封装
    jsonWrite:function (res, ret) {
        if(typeof ret === 'undefined') {
            res.json({
                code:'10001',
                msg: '操作失败'
            });
        } else {
            res.json(ret);
        }
    },
    uuidTools:function(res,ret,next){
        var uuid =  UUID.v1().replace(/-/g,"");
        return uuid;
    }
};