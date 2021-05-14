const express = require('express');
const app = express();
const router = require('./router/index')
const bodyParser = require('body-parser');


app.use((req, res, next) => {
    console.log(req.ip);
    next();
})
app.use(bodyParser.json({ limit: '50mb' }));
app.use(router);

app.listen(8001, function() {
    console.log('服务端已经启动');
});