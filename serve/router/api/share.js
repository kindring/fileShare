const router = require("express").Router();
const db = require('../../db/index');
const { handel } = require('../../tools/index')

// 增
// 删
// 改
// 查

router.get('add', async(req, res) => {
    let body = req.body;
    let [newDb, err] = await handel(db.dbAddHandel(body));
    if (err) {
        res.json({
            code: 2,
            message: err.message
        });
    } else {
        res.json({
            code: 1,
            data: newDb,
        })
    }
});

module.exports = router;