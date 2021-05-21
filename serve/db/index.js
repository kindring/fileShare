const nedb = require('nedb');
const joi = require('joi');

const db = new nedb({
    filename: './codeData.db',
    autoload: true,
})
let dbData = {
    hash: 'xxx', //文件hash值 唯一值
    filePath: '', //文件路径
    fileName: '', //文件名称
    shareCode: '', //有很多个分享码
    ip: '', //IP地址
}

let schema = {
    hash: joi.string().required().error(new Error('文件hash值必须拥有')),
    fileName: joi.string().error(new Error('文件名为字符串格式')),
    filePath: joi.string().error(new Error('文件路径为字符串格式')),
    shareCode: joi.string().required().error(new Error('分享码为字符串格式')),
    ip: joi.string().default('127.0.0.1').error(new Error('IP地址为字符串格式')),
}

let createSchema = joi.object(schema);
let updateScheam = joi.object({
    ...schema,
    _id: joi.string()
})

/** 
 * 新增文件
 * @param {*} data 数据内容
 */
function dbAddHandel(data, _id) {
    return new Promise((resolve, reject) => {
        try {
            let finalData = _id ? updateScheam.validate({...data, _id }) : createSchema.validate(data);
            if (finalData.error) return reject(finalData.error);
            finalData.value[_id ? 'createDate' : 'updateDate'] = new Date();
            db[_id ? 'update' : 'insert'](finalData.value, (err, doc) => err ? reject(err) : resolve(doc));
        } catch (error) {
            reject(error);
        }
    });
}

// 三种情况
// 知道id
// 知道hash
// 知道code

// id hash
// id code
// hash code
// id hash code
// id code hash

/**
 * 查找文件 通过id进行查找 以及文件md5和文件分享码来进行查找
 * @param {*} query 
 */
function dbFindHandel(query) {
    return new Promise((resolve, reject) => {
        try {
            db.find(query, (err, docs) => {
                err ? reject(err) : resolve(docs);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function dbRemoveHandel(_id) {
    return new Promise((resolve, reject) => {
        if (_id) {
            return reject({ message: '数据不正常' })
        }
        db.remove({ _id }, (err, n) => {
            err ? reject(err) : resolve(n);
        });
    });
}

module.exports = {
    dbAddHandel,
    dbFindHandel,
    dbRemoveHandel
}