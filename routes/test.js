var express = require("express");
var router = express.Router();

/**
 * 测试get请求，获取web数据
 */
router.get("/api/getTest", function (req, res, next) {
  //   console.log(req.query);
  // 解决跨域问题
  res.set("Access-Control-Allow-Origin", "*");
  // res.send 将数据发送给前端

  res.send({
    name: req.query.name,
    age: 18,
    sex: true,
  });
});

/**
 * 测试post请求，获取web数据
 */
router.post("/api/postTest", function (req, res, next) {
  console.log(req.body);
  // 解决跨域问题
  res.set("Access-Control-Allow-Origin", "*");
  // res.send 将数据发送给前端
  res.send({
    name: req.body.name,
    age: 11,
  });
});

module.exports = router;
