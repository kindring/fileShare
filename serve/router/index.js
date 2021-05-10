const router = require('express').Router();
const api = require('./api/index.js')

router.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Content-Type', 'application/json;charset=utf-8');
    // if (req.method === "OPTIONS") {
    //     res.status = 200;
    //     res.end();
    //     return;
    // }
    next();
});

// router.get('/', (req, res) => {
//     res.send('hello world');
// })

router.use('/api', api);

module.exports = router;