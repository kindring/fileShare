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

/** 新增文件 */
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

function dbFindHandel(_id)