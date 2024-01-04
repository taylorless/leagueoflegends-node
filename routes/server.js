const express = require("express");
const router = express.Router();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { exec } = require("child_process");
const https = require("https");
const { default: axios } = require("axios");

let allData = null;

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

const getRiotData = async (url, method = "GET", params) => {
  if (allData == null) return false;

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
    params: params,
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

const getRiotData1 = () => {
  if (allData == null) return false;

  //通过正则匹配拿到token和port
  const token = allData.match(/remoting-auth-token=(.*?)["'\s]/)[1];
  const port = allData.match(/--app-port=(.*?)["'\s]/)[1];
  const auth = Buffer.from(`riot:${token}`).toString("base64");
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Basic ${auth}`,
  };
  const service = axios.create({
    baseURL: `127.0.0.1:${port}`,
    timeout: 10000,
    headers: headers,
  });
  return service;
};

const main = async () => {
  try {
    const leagueClientCommandline = await findLeagueClientCommandLine();
    // console.log("LeagueClientUx.exe 命令行参数:", leagueClientCommandline);
  } catch (error) {
    console.error("发生错误:", error);
  }
};

main();

//node定义接口
// 查询本地召唤师信息
router.get("/getCurrentSummoner", async (req, res, next) => {
  const data = await getRiotData("/lol-summoner/v1/current-summoner");

  // const data = await getRiotData1({
  //   url: "/lol-summoner/v1/current-summoner",
  //   method: "get",
  // });

  // const data = await getRiotData1().get("/lol-summoner/v1/current-summoner");
  res.send(data);
});

//根据ppuid查询近期战绩（20局）
router.get("/getDataByPuuid", async (req, res, next) => {
  const puuid = req.query.puuid;
  const data = await getRiotData(
    `/lol-match-history/v1/products/lol/${puuid}/matches`
  );
  res.send(data);
});

//根据name查询召唤师信息
router.get("/getSummonerInfoByName", async (req, res, next) => {
  const name = req.query.name;
  const data = await getRiotData(
    encodeURI(`/lol-summoner/v1/summoners?name=${name}`)
  );
  res.send(data);
});

module.exports = router;
