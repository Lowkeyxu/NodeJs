/**
 * Created by xuwc on 2017/11/2.
 * 用户DaoMapping
 */

var user = {
    insert:' INSERT INTO sys_user(id,loginName,userName,sex,password,addTime,addUserId,addMark) VALUES(?,?,?,?,?,?,?,?) ',

    update:' UPDATE sys_user SET loginName=?, userName=?,sex=?,password=? WHERE id=? ',

    delete: ' DELETE FROM sys_user WHERE id=? ',

    queryById: ' SELECT * FROM sys_user WHERE id=? ',

    queryAll: " SELECT * FROM sys_user WHERE delFlag='0' "
};

module.exports = user;