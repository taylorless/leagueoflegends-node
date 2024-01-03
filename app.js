var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const testRouter = require("./routes/test");
const serverRouter = require("./routes/server");

var app = express();
//将文件部署到服务器
app.use(express.static("img"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(indexRouter);
app.use(usersRouter);
app.use(testRouter);
app.use(serverRouter);

// 解决post请求获取请求体的问题
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//后端解决跨域
app.use(cors());

// app.listen(3000, () => {
//   console.log("服务器启动成功");
// });

module.exports = app;
