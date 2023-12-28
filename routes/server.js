const express = require("express");
const router = express.Router();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { exec } = require("child_process");
const https = require("https");

let allData = null;
let currentUser = null;
//拿去当前电脑客户端登录的lol用户基础信息
const findLeagueClientCommandLine = async () => {
  return new Promise((resolve, reject) => {
    exec(
      '"C:\\Windows\\System32\\wbem\\wmic" PROCESS WHERE "name=\'LeagueClientUx.exe\'" GET commandline',
      (err, stdout) => {
        if (err) {
          reject(err);
        } else {
          allData = stdout;
          resolve(stdout);
        }
      }
    );
  });
};

const getRiotData = async (url, method = "GET") => {
  //通过正则匹配拿到token和port
  const token = allData.match(/remoting-auth-token=(.*?)["'\s]/)[1];
  const port = allData.match(/--app-port=(.*?)["'\s]/)[1];
  const auth = Buffer.from(`riot:${token}`).toString("base64");
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Basic ${auth}`,
  };
  const options = {
    hostname: "127.0.0.1",
    port: port,
    path: url,
    method: method,
    headers: headers,
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(data);
      });
    });
    req.on("error", (error) => {
      reject(error);
    });
    req.end();
  });
};

const main = async () => {
  try {
    const leagueClientCommandline = await findLeagueClientCommandLine();
    // console.log("LeagueClientUx.exe 命令行参数:", leagueClientCommandline);
    currentUser = await getRiotData("/lol-summoner/v1/current-summoner");
    // console.log("当前user信息为:", currentUser);
  } catch (error) {
    console.error("发生错误:", error);
  }
};

main();

//node定义接口
router.get("/api/getCurrentUserInfo", function (req, res, next) {
  res.send(currentUser);
});

module.exports = router;
