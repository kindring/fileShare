const express = require('express');
const app = express();
const router = require('./router/index')
const bodyParser = require('body-parser');

const path = require('path');
const cleanDir = require('./tools/index').cleanDir;
const {handel} = require('./tools/index');



(async()=>{

    let [clear,clearErr] = await handel(cleanDir(path.join(__dirname,'./tmp'),{recursive:true}));
    if(clearErr){
        console.error('清除临时文件夹错误');
        console.error(clearErr);
    }else{
        console.log('临时文件夹清理成功');
    }
    express.response.customJson = function(data,error){
        console.log('TEST');
        this.json(data);
    };

    app.use((req, res, next) => {
        console.log(req.ip);
        next();
    })
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(router);



    app.listen(8001, function() {
        console.log('服务端已经启动');
    });




})()



