const express = require("express");
const router = express.Router();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { exec } = require("child_process");
const https = require("https");
const { default: axios } = require("axios");

let allData = null;
let currentSummonerChampionMastery = null; //本地召唤师英雄熟练度
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

const getRiotData1 = async () => {
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
  // const currentSummonerInfo = await getRiotData(
  //   "/lol-summoner/v1/current-summoner"
  // );
  const currentSummonerInfo = await getRiotData1({
    url: "/lol-summoner/v1/current-summoner",
    method: "get",
  });
  res.send(currentSummonerInfo);
});

//根据summonerID查询战绩
router.get("/getMatchHistoryBySummonerId", async (req, res, next) => {
  console.log(req.query);
  const summonerId = req.query.summonerId;
  const MatchHistory = await getRiotData(
    `/lol-match-history/v1/products/lol/${summonerId}/matches`
  );

  res.send(MatchHistory);
});

//查询本地召唤师排位分数
router.get("/getCurrentSummonerRankInfo", async (req, res, next) => {
  const puuid = req.query.puuid;
  const currentSummonerRankInfo = await getRiotData(
    `/lol-ranked/v1/current-ranked-stats${puuid}`
  );

  res.send(currentSummonerRankInfo);
});

//查询本地召唤师英雄熟练度
router.get("/getCurrentSummonerChampionMastery", function (req, res, next) {
  res.send(currentSummonerChampionMastery);
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
  const a = JSON.stringify({ name: name });
  const data = await getRiotData("/lol-summoner/v1/summoners", "GET", a);
  res.send(data);
});

module.exports = router;
