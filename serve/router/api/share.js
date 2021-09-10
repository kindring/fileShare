const router = require("express").Router();
const fs = require('fs');
const path = require('path');
const db = require('../../db/index');
const { handel, file } = require('../../tools/index');

const UPLOAD_DIR = path.join(__dirname, '../../upload');
const extractExt = file.extractExt;

// 增 hash shareCode filename
router.post('/add', async(req, res) => {
    let { hash, shareCode,filename } = req.body;
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip);
    console.log(shareCode);
    // 得到文件路径,并且获取
    const ext = extractExt(filename);
    const finalFileName = `${hash}${ext}`;
    //  只存储文件
    const filePath = path.resolve(`${hash}`, finalFileName)
        // 文件是否存在,
        console.log(fs.existsSync(filePath))
    let fileIsExit = fs.existsSync(filePath);
    if (!fileIsExit) {
        return res.json({
            code: 2,
            message: 'file not uploaded'
        })
    };
    // 存储数据
    let [newDb, err] = await handel(db.dbAddHandel({
        hash,
        filePath,
        fileName:filename,
        shareCode: shareCode + '',
        ip,
    }));
    let resultData = {
        code: err ? err.code || 2 : 1,
        message: err ? err.message : 'ok',
        data: newDb
    }
    res.json(resultData);
});
//改
router.post('/update', async(req, res) => {
    let body = req.body;
    console.log(body);
    // res.json();
});

//查, shareCode
router.post('/find', async(req, res) => {
    let body = req.body;
    console.log(body);
    let [newDb, err] = await handel(db.dbFindHandel(body));
    let resultData = {
        code: err ? err.code || 2 : 1,
        message: err?err.message :'ok',
        data: newDb
    }
    res.json(resultData);
});
module.exports = router;