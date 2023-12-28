var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/api/users", function (req, res, next) {
  res.send("我是users路由返回的数据");
});

module.exports = router;
