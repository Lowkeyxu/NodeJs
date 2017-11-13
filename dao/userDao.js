/**
 * Created by xuwc on 2017/11/2.
 */
var mysql = require('mysql');
var $conf = require('../conf/db');
var $sql = require('./mappings/userDaoMapping');
var $common = require('../common/common');

// 使用连接池，提升性能
//var pool  = mysql.createPool($util.extend({}, $conf.mysql));
var pool  = mysql.createPool($conf.mysql);

module.exports = {
    add: function (req, res, next) {
        pool.getConnection(function(err, connection) {
            // 获取前台页面传过来的参数
            var param = req.query || req.params;
            var sql_params = [param.id,param.loginName,param.userName,param.sex,param.password,param.addTime,param.addUserId,param.addMark];
            connection.query($sql.insert, sql_params, function(err, result) {
                if(result) {
                    result = {
                        code: 10000,
                        msg:'添加成功'
                    };
                }

                // 以json形式，把操作结果返回给前台页面
                //$common.jsonWrite(res, result);
                next(result);

                // 释放连接
                connection.release();
            });
        });
    },
    delete: function (req, res, next) {
        // delete by Id
        pool.getConnection(function(err, connection) {
            var id = req.query.id;
            connection.query($sql.delete, id, function(err, result) {
                if(result.affectedRows > 0) {
                    result = {
                        code: 10000,
                        msg:'删除成功'
                    };
                } else {
                    result = void 0;
                }
                next(result);
                //$common.jsonWrite(res, result);
                connection.release();
            });
        });
    },
    update: function (req, res, next) {
        // update by id
        var param = req.query;
        if(param.id == null || param.loginName == null || param.userName == null || param.sex == null || param.password == null) {
            $common.jsonWrite(res, undefined);
            return;
        }

        pool.getConnection(function(err, connection) {
            connection.query($sql.update, [param.loginName, param.userName, param.sex, param.password,param.id], function(err, result) {
                // 使用页面进行跳转提示
                if(result.affectedRows > 0) {
                    next(result);
                    //$common.jsonWrite(res, result);
                } else {
                    $common.jsonWrite(res, {code:'10001',msg: '更新失败'});
                }
                connection.release();
            });
        });

    },
    queryById: function (req, res, next) {
        var id = req.query.id; // 为了拼凑正确的sql语句，这里要转下整数
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryById, id, function(err, result) {
                next(result);
                //$common.jsonWrite(res, result);
                connection.release();

            });
        });
    },
    queryAll: function (req, res, next) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryAll, function(err, result) {
                //$common.jsonWrite(res, result);
                next(result);
                connection.release();
            });
        });
    },
    queryUser:function (req,res,next) {
        var param = req.body;
        var params = [param.loginName,param.password];
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryUser,params,function(err, result) {
                next(result);
                connection.release();
            });
        });
    },
    saveRegister:function(req,res,next){
        var param = req.body;
        var imgurl = "/images/user/user.jpg";
        if(param.photoImage !== "" && param.photoImage !== undefined){
            imgurl = param.photoImage
        }
        var id = $common.uuidTools(req, res, next);
        var params = [id,param.loginName,param.userName,param.sex,imgurl,param.password,$common.getNowTime()];
        pool.getConnection(function(err, connection) {
            connection.query($sql.saveRegister,params,function(err, result) {
                next(result);
                connection.release();
            });
        });
    },
    queryUserInfo: function (id,next) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryById, [id], function(err, result) {
                next(result);
                connection.release();

            });
        });
    }
};

