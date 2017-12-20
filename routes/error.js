var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    return res.render('message', {
        msg: '很抱歉，此頁面基本上不存在的。'
    });
});

module.exports = router;