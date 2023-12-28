var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express--------" });
  res.send("我是index路由返回的数据");
});

module.exports = router;
