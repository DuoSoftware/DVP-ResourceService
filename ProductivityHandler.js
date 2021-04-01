/**
 * Created by Administrator on 3/21/2016.
 */

var format = require("stringformat");
var config = require("config");
var redis = require("ioredis");
var messageFormatter = require("dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js");
var logger = require("dvp-common-lite/LogHandler/CommonLogHandler.js").logger;
var productivitySummary = require("./ProductivitySummaryHandler");
/*var format = require('string-format');*/
var moment = require("moment");

var redisip = config.Redis.ip;
var redisport = config.Redis.port;
var redispass = config.Redis.password;
var redismode = config.Redis.mode;
var redisdb = config.Redis.db;

var redisSetting = {
  port: redisport,
  host: redisip,
  family: 4,
  db: redisdb,
  retryStrategy: function (times) {
    var delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: function (err) {
    return true;
  },
};

if (redispass != "") redisSetting.password = redispass;

if (redismode == "sentinel") {
  if (
    config.Redis.sentinels &&
    config.Redis.sentinels.hosts &&
    config.Redis.sentinels.port &&
    config.Redis.sentinels.name
  ) {
    var sentinelHosts = config.Redis.sentinels.hosts.split(",");
    if (Array.isArray(sentinelHosts) && sentinelHosts.length > 2) {
      var sentinelConnections = [];

      sentinelHosts.forEach(function (item) {
        sentinelConnections.push({
          host: item,
          port: config.Redis.sentinels.port,
        });
      });

      redisSetting = {
        sentinels: sentinelConnections,
        name: config.Redis.sentinels.name,
        db: redisdb,
      };

      if (redispass != "") redisSetting.password = redispass;
    } else {
      console.log("No enough sentinel servers found .........");
    }
  }
}

var redisClient = undefined;

if (redismode != "cluster") {
  redisClient = new redis(redisSetting);
} else {
  var redisHosts = redisip.split(",");
  if (Array.isArray(redisHosts)) {
    redisSetting = [];
    redisHosts.forEach(function (item) {
      let redisConf = {
        host: item,
        port: redisport,
        family: 4,
        db: redisdb,
      };

      if (redispass != "") redisConf.password = redispass;
      redisSetting.push(redisConf);
    });

    var redisClient = new redis.Cluster([redisSetting]);
  } else {
    redisClient = new redis(redisSetting);
  }
}

redisClient.on("error", function (err) {
  console.log("Redis connection error  " + err);
});

redisClient.on("connect", function (err) {});

var ardsredisip = config.ArdsRedis.ip;
var ardsredisport = config.ArdsRedis.port;
var ardsredispass = config.ArdsRedis.password;
var ardsredismode = config.ArdsRedis.mode;
var ardsredisdb = config.ArdsRedis.db;

var redisArdsSetting = {
  port: ardsredisport,
  host: ardsredisip,
  db: ardsredisdb,
  retryStrategy: function (times) {
    var delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: function (err) {
    return true;
  },
};

if (ardsredispass != "") redisArdsSetting.password = ardsredispass;

if (ardsredismode == "sentinel") {
  if (
    (config.ArdsRedis.sentinels &&
      config.ArdsRedis.sentinels.hosts &&
      config.ArdsRedis.sentinels.port,
    config.ArdsRedis.sentinels.name)
  ) {
    var sentinelHosts = config.ArdsRedis.sentinels.hosts.split(",");
    if (Array.isArray(sentinelHosts) && sentinelHosts.length > 2) {
      var sentinelConnections = [];

      sentinelHosts.forEach(function (item) {
        sentinelConnections.push({
          host: item,
          port: config.ArdsRedis.sentinels.port,
        });
      });

      redisArdsSetting = {
        sentinels: sentinelConnections,
        name: config.ArdsRedis.sentinels.name,
        db: ardsredisdb,
      };

      if (ardsredispass != "") redisArdsSetting.password = ardsredispass;
    } else {
      console.log("No enough sentinel servers found .........");
    }
  }
}

var redisArdsClient = undefined;

if (ardsredismode != "cluster") {
  redisArdsClient = new redis(redisArdsSetting);
} else {
  var redisHosts = redisip.split(",");
  if (Array.isArray(redisHosts)) {
    redisArdsSetting = [];
    redisHosts.forEach(function (item) {
      let redisConf = {
        host: item,
        port: ardsredisport,
        family: 4,
        db: ardsredisdb,
      };
      if (ardsredispass != "") redisConf.password = ardsredispass;
      redisArdsSetting.push(redisConf);
    });

    var redisArdsClient = new redis.Cluster([redisArdsSetting]);
  } else {
    redisArdsClient = new redis(redisArdsSetting);
  }
}

//**** ards data con
// redisArdsClient.auth(config.ArdsRedis.password, function (err) {
//   /*if (err)
//      throw err;*/
//   console.log("Redis[ARDS] Auth error  " + err);
// });

redisArdsClient.on("error", function (err) {
  console.log("Redis[ARDS] connection error  " + err);
});

redisArdsClient.on("connect", function (err) {});

// module.exports.Productivity = function (req, res, companyId, tenantId) {
//
//
//     var AgentsProductivity = [];
//     var id = format("Resource:{0}:{1}:*", companyId, tenantId);
//     var bu = req.query.bu || "default";
//
//     /*function toSeconds(time) {
//      var sTime = time.split(':'); // split it at the colons
//      // minutes are worth 60 seconds. Hours are worth 60 minutes.
//      return (+sTime[0]) * 60 * 60 + (+sTime[1]) * 60 + (+sTime[2]);
//      }*/
//
//
//     redisArdsClient.keys(id, function (err, resourceIds) {
//         console.log("start");
//         if (err) {
//             logger.error('[TransferCallCount] - [%s]', id, err);
//             var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
//             res.end(jsonString);
//         }
//         else {
//             console.log(resourceIds);
//             console.log("-------------------------");
//             var count = 0;
//
//             (async function resourceIter() {
//                 if (resourceIds.length > 0) {
//
//                     async function operation() {
//                         var currentObj = await redisArdsClient.get(currentState);
//
//
//                         if (err) {
//                             logger.error('[TransferCallCount] - [%s]', id, err);
//                             var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
//                             res.end(jsonString);
//                         }
//                         else {
//
//                             (async function redisGetKeys(){
//                             var keys = [inboundCallTime, acwInbound, acwOutbound, breakTime, incomingCallCount, inboundHoldTime, outboundHoldTime, transferCount, outboundCallTime, outgoingCallCount, outgoingAnswerCount];
//
//                             async function redisMget() {
//                                 await redisClient.mget(keys, function (err, reuslt) {
//                                     if (err) {
//                                         console.log(err);
//                                     }
//                                     else {
//                                         var tempInboundOnCallTime = parseInt(reuslt[0] ? reuslt[0] : 0);
//                                         var tempOutboundOnCallTime = parseInt(reuslt[8] ? reuslt[8] : 0);
//                                         productivity.InboundAcwTime = parseInt(reuslt[1] ? reuslt[1] : 0);
//                                         productivity.OutboundAcwTime = parseInt(reuslt[2] ? reuslt[2] : 0);
//                                         productivity.InboundHoldTime = parseInt(reuslt[5] ? reuslt[5] : 0);
//                                         productivity.OutboundHoldTime = parseInt(reuslt[6] ? reuslt[6] : 0);
//
//                                         productivity.InboundCallTime = tempInboundOnCallTime - productivity.InboundHoldTime;
//                                         productivity.OutboundCallTime = tempOutboundOnCallTime - productivity.OutboundHoldTime;
//                                         productivity.OutboundAnswerCount = parseInt(reuslt[10] ? reuslt[10] : 0);
//                                         productivity.InboundCallTime = (productivity.InboundCallTime > 0) ? productivity.InboundCallTime : 0;
//                                         productivity.OutboundCallTime = (productivity.OutboundCallTime > 0) ? productivity.OutboundCallTime : 0;
//
//                                         productivity.OnCallTime = productivity.InboundCallTime + productivity.OutboundCallTime;
//                                         productivity.AcwTime = productivity.InboundAcwTime + productivity.OutboundAcwTime;
//                                         productivity.BreakTime = parseInt(reuslt[3] ? reuslt[3] : 0);
//                                         productivity.IncomingCallCount = parseInt(reuslt[4] ? reuslt[4] : 0);
//                                         productivity.HoldTime = productivity.InboundHoldTime + productivity.OutboundHoldTime;
//                                         productivity.TransferCallCount = parseInt(reuslt[7] ? reuslt[7] : 0);
//                                         productivity.OutgoingCallCount = parseInt(reuslt[9] ? reuslt[9] : 0);
//
//
//                                         (async function staffTimeProcess(){
//
//                                         async function redisHget() {
//                                             await redisClient.hget(staffedTime, "time", function (err, reuslt) {
//                                                 if (err) {
//                                                     console.log(err);
//                                                 }
//                                                 else {
//                                                     try {
//
//                                                         if (reuslt) {
//
//                                                             var now = "04/09/2013 15:00:00";
//                                                             var then = "04/09/2013 14:20:30";
//
//                                                             var timetet = moment.utc(moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(moment(moment(reuslt), "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
//
//                                                             var stfTime = moment.utc(moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(moment(moment(reuslt), "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss"); // split it at the colons
//                                                             productivity.StaffedTime = toSeconds(stfTime);
//                                                             var workTime = 0;
//                                                             try {
//                                                                 /*var currentStateSpendTime = currentObj.StateChangeTime;*/
//                                                                 workTime = parseInt(productivity.OnCallTime) + parseInt(productivity.AcwTime) + parseInt(productivity.BreakTime) + parseInt(productivity.HoldTime);
//
//                                                                 var sTime = JSON.parse(currentObj);
//
//                                                                 /*
//                                                                  if( moment(sTime.StateChangeTime)>moment(reuslt)){
//                                                                  var currentStateSpendTime = moment.utc(moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(moment(sTime.StateChangeTime))).format("HH:mm:ss"); // split it at the colons
//                                                                  workTime = parseInt(workTime) + parseInt(toSeconds(currentStateSpendTime));
//                                                                  }*/
//
//
//                                                             }
//                                                             catch (ex) {
//                                                                 console.log(err);
//                                                             }
//
//                                                             (async function LastDayStafftimeProcess(){
//
//
//                                                                 async function redisStafftimeLastDay() {
//                                                                     try {
//                                                                     await redisClient.get(staffedTimeLastDay, function (err, reuslt) {
//                                                                         if (err) {
//                                                                             console.log(err);
//                                                                         }
//                                                                         else {
//                                                                             if (reuslt) {
//                                                                                 try {
//                                                                                     /*sTime = moment.utc(moment(moment(),"DD/MM/YYYY HH:mm:ss").diff(moment(moment(reuslt),"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss"); // split it at the colons*/
//                                                                                     productivity.StaffedTime = parseInt(reuslt) + parseInt(productivity.StaffedTime);
//                                                                                     /*productivity.StaffedTime = parseInt(toSeconds(sTime)) + parseInt(productivity.StaffedTime);*/
//                                                                                 }
//                                                                                 catch (ex) {
//                                                                                     console.log(err);
//                                                                                 }
//                                                                             }
//                                                                             productivity.IdleTime = parseInt(productivity.StaffedTime) - parseInt(workTime);
//
//                                                                             (async function frf() {
//
//
//                                                                                 async function getMissedCallCount() {
//                                                                                     await redisClient.keys(missCallCount, function (err, ids) {
//                                                                                         if (err) {
//                                                                                             console.log(err);
//                                                                                         }
//                                                                                         else {
//
//                                                                                             (async function de() {
//                                                                                                 async function getIds() {
//                                                                                                     await redisClient.mget(ids, function (err, misscalls) {
//
//                                                                                                         try {
//                                                                                                             productivity.MissCallCount = 0;
//                                                                                                             productivity.MissCallCount = misscalls.reduce(function (pv, cv) {
//                                                                                                                 return parseInt(pv) + parseInt(cv);
//                                                                                                             }, 0);
//                                                                                                         } catch (ex) {
//                                                                                                             console.log(err);
//                                                                                                         }
//
//                                                                                                         // if (req.query.productivityStartDate && req.query.productivityEndDate) {
//                                                                                                         //     productivitySummary.GetFirstLoginForTheDate(resourceId, req.query.productivityStartDate, req.query.productivityEndDate).then(function (firstLoginRecord) {
//                                                                                                         //         count++;
//                                                                                                         //         productivity.LoginTime = firstLoginRecord ? firstLoginRecord.createdAt : undefined;
//                                                                                                         //         AgentsProductivity.push(productivity);
//                                                                                                         //         if (count == resourceIds.length) {
//                                                                                                         //
//                                                                                                         //             var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, AgentsProductivity);
//                                                                                                         //             logger.info('[Productivity] . [%s] -[%s]', AgentsProductivity, jsonString);
//                                                                                                         //             res.end(jsonString);
//                                                                                                         //         }
//                                                                                                         //     }).catch(function (err) {
//                                                                                                         //         count++;
//                                                                                                         //         AgentsProductivity.push(productivity);
//                                                                                                         //         if (count == resourceIds.length) {
//                                                                                                         //
//                                                                                                         //             var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, AgentsProductivity);
//                                                                                                         //             logger.info('[Productivity] . [%s] -[%s]', AgentsProductivity, jsonString);
//                                                                                                         //             res.end(jsonString);
//                                                                                                         //         }
//                                                                                                         //
//                                                                                                         //     });
//                                                                                                         // } else {
//                                                                                                         count++;
//                                                                                                         AgentsProductivity.push(productivity);
//                                                                                                         // if (count == resourceIds.length) {
//                                                                                                         //
//                                                                                                         //     var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, AgentsProductivity);
//                                                                                                         //     logger.info('[Productivity] . [%s] -[%s]', AgentsProductivity, jsonString);
//                                                                                                         //     res.end(jsonString);
//                                                                                                         // }
//                                                                                                         //}
//
//                                                                                                     });
//                                                                                                 }
//
//
//                                                                                                 await getIds();
//                                                                                             })();
//
//
//                                                                                         }
//                                                                                     });
//
//                                                                                 }
//
//                                                                                 await getMissedCallCount();
//                                                                             })();
//                                                                         }
//                                                                     });
//
//                                                                 }
//
//                                                             catch
//                                                                 (ex)
//                                                                 {
//                                                                     console.log(err);
//                                                                 }
//                                                             }
//                                                             await redisStafftimeLastDay();
//                                                             })();
//                                                         }  //check if the user has a staffed time today
//
//                                                         else {
//                                                             productivity.StaffedTime = 0;
//                                                             productivity.IdleTime = 0;
//                                                             // var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, AgentsProductivity);
//                                                             // logger.info('[Productivity-miss some data1] . [%s] -[%s]', AgentsProductivity, jsonString);
//                                                             AgentsProductivity.push(productivity);
//                                                             count++;
//
//                                                         }
//                                                     } catch (ex) {
//                                                         console.log(ex);
//                                                     }
//
//
//                                                 }
//                                             });
//                                         }
//
//                                         await redisHget();
//                                     })()
//                                     }
//                                 });
//                             }
//
//                             await redisMget();
//                             })()
//                         }
//
//
//                     }
//
//                     for (const resId of resourceIds) {
//
//                         //Resource:3:1:1
//
//                         var resourceId = resId.split(":")[3];
//                         var productivity = {
//                             ResourceId: resourceId,
//                             LoginTime: undefined,
//                             AcwTime: 0,
//                             BreakTime: 0,
//                             OnCallTime: 0,
//                             StaffedTime: 0,
//                             IdleTime: 0,
//                             HoldTime: 0,
//                             IncomingCallCount: 0,
//                             OutgoingCallCount: 0,
//                             TransferCallCount: 0,
//                             MissCallCount: 0,
//                             InboundCallTime: 0,
//                             OutboundCallTime: 0,
//                             InboundAcwTime: 0,
//                             OutboundAcwTime: 0,
//                             InboundHoldTime: 0,
//                             OutboundHoldTime: 0,
//                             OutboundAnswerCount: 0
//                         };
//                         if (bu === 'default') {
//
//                             var inboundCallTime = format("TOTALTIME:{0}:{1}:CONNECTED:{2}:CALLinbound", tenantId, companyId, resourceId);
//                             var staffedTime = format("SESSION:{0}:{1}:{2}:LOGIN:{3}:{3}:Register", tenantId, companyId, bu, resourceId);
//                             var acwInbound = format("TOTALTIME:{0}:{1}:AFTERWORK:{2}:AfterWorkCALLinbound", tenantId, companyId, resourceId);
//                             var acwOutbound = format("TOTALTIME:{0}:{1}:AFTERWORK:{2}:AfterWorkCALLoutbound", tenantId, companyId, resourceId);
//                             var breakTime = format("TOTALTIMEWSPARAM:{0}:{1}:BREAK:{2}", tenantId, companyId, resourceId);
//                             var incomingCallCount = format("TOTALCOUNT:{0}:{1}:CONNECTED:{2}:CALLinbound", tenantId, companyId, resourceId);
//                             var missCallCount = format("TOTALCOUNT:{0}:{1}:AGENTREJECT:*:{2}", tenantId, companyId, resourceId);
//                             var staffedTimeLastDay = format("TOTALTIME:{0}:{1}:LOGIN:{2}:Register", tenantId, companyId, resourceId);
//                             var currentState = format("ResourceState:{0}:{1}:{2}", companyId, tenantId, resourceId);
//                             var inboundHoldTime = format("TOTALTIME:{0}:{1}:AGENTHOLD:{2}:inbound", tenantId, companyId, resourceId);
//                             var outboundHoldTime = format("TOTALTIME:{0}:{1}:AGENTHOLD:{2}:outbound", tenantId, companyId, resourceId);
//                             var transferCount = format("TOTALCOUNTWSPARAM:{0}:{1}:AGENTTRANSFER:{2}", tenantId, companyId, resourceId);
//                             var outboundCallTime = format("TOTALTIME:{0}:{1}:CONNECTED:{2}:CALLoutbound", tenantId, companyId, resourceId);
//                             var outgoingCallCount = format("TOTALCOUNT:{0}:{1}:CONNECTED:{2}:CALLoutbound", tenantId, companyId, resourceId);
//                             var outgoingAnswerCount = format("TOTALCOUNT:{0}:{1}:CALLANSWERED:{2}:outbound", tenantId, companyId, resourceId);
//
//                             /* var transferCall = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");
//                              var idleTime = "TOTALTIME:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "LOGIN", resourceId, "parameter2");
//                              var holdTime = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");*/
//                         }
//                         else {
//                             var inboundCallTime = format("TOTALTIME:{0}:{1}:{2}:CONNECTED:{3}:CALLinbound", tenantId, companyId, bu, resourceId);
//                             var staffedTime = format("SESSION:{0}:{1}:{2}:LOGIN:{3}:{3}:Register", tenantId, companyId, bu, resourceId);
//                             var acwInbound = format("TOTALTIME:{0}:{1}:{2}:AFTERWORK:{3}:AfterWorkCALLinbound", tenantId, companyId, bu, resourceId);
//                             var acwOutbound = format("TOTALTIME:{0}:{1}:{2}:AFTERWORK:{3}:AfterWorkCALLoutbound", tenantId, companyId, bu, resourceId);
//                             var breakTime = format("TOTALTIMEWSPARAM:{0}:{1}:{2}:BREAK:{3}", tenantId, companyId, bu, resourceId);
//                             var incomingCallCount = format("TOTALCOUNT:{0}:{1}:{2}:CONNECTED:{3}:CALLinbound", tenantId, companyId, bu, resourceId);
//                             var missCallCount = format("TOTALCOUNT:{0}:{1}:{2}:AGENTREJECT:*:{3}", tenantId, companyId, bu, resourceId);
//                             var staffedTimeLastDay = format("TOTALTIME:{0}:{1}:{2}:LOGIN:{3}:Register", tenantId, companyId, bu, resourceId);
//                             var currentState = format("ResourceState:{0}:{1}:{2}", companyId, tenantId, resourceId);
//                             var inboundHoldTime = format("TOTALTIME:{0}:{1}:{2}:AGENTHOLD:{3}:inbound", tenantId, companyId, bu, resourceId);
//                             var outboundHoldTime = format("TOTALTIME:{0}:{1}:{2}:AGENTHOLD:{3}:outbound", tenantId, companyId, bu, resourceId);
//                             var transferCount = format("TOTALCOUNTWSPARAM:{0}:{1}:{2}:AGENTTRANSFER:{3}", tenantId, companyId, bu, resourceId);
//                             var outboundCallTime = format("TOTALTIME:{0}:{1}:{2}:CONNECTED:{3}:CALLoutbound", tenantId, companyId, bu, resourceId);
//                             var outgoingCallCount = format("TOTALCOUNT:{0}:{1}:{2}:CONNECTED:{3}:CALLoutbound", tenantId, companyId, bu, resourceId);
//                             var outgoingAnswerCount = format("TOTALCOUNT:{0}:{1}:{2}:CALLANSWERED:{3}:outbound", tenantId, companyId, bu, resourceId);
//                         }
//
//                         await operation();
//
//
//                     }
//
//                     var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, AgentsProductivity);
//                     logger.info('[Productivity-miss some data1] . [%s] -[%s]', AgentsProductivity, jsonString);
//                     res.end(jsonString);
//
//                 } else {
//
//                     var jsonString = messageFormatter.FormatMessage(undefined, "No Registered Resource Found", true, []);
//                     logger.info('[Productivity] . [%s]', jsonString);
//                     res.end(jsonString);
//                 }
//             })()
//
//         }
//
//     });
//
// };

module.exports.Productivity = function (req, res, companyId, tenantId) {
  var AgentsProductivity = [];
  var id = format("Resource:{0}:{1}:*", companyId, tenantId);
  var bu = req.query.bu || "default";

  /*function toSeconds(time) {
     var sTime = time.split(':'); // split it at the colons
     // minutes are worth 60 seconds. Hours are worth 60 minutes.
     return (+sTime[0]) * 60 * 60 + (+sTime[1]) * 60 + (+sTime[2]);
     }*/

  redisArdsClient.keys(id, function (err, resourceIds) {
    if (err) {
      logger.error("[TransferCallCount] - [%s]", id, err);
      var jsonString = messageFormatter.FormatMessage(
        err,
        "EXCEPTION",
        false,
        undefined
      );
      res.end(jsonString);
    } else {
      console.log(resourceIds);
      console.log("-------------------------");
      var count = 0;
      if (resourceIds.length > 0) {
        resourceIds.forEach(function (resId) {
          //Resource:3:1:1
          var resourceId = resId.split(":")[3];

          var productivity = {
            ResourceId: resourceId,
            LoginTime: undefined,
            AcwTime: 0,
            BreakTime: 0,
            OnCallTime: 0,
            StaffedTime: 0,
            IdleTime: 0,
            HoldTime: 0,
            IncomingCallCount: 0,
            OutgoingCallCount: 0,
            TransferCallCount: 0,
            MissCallCount: 0,
            InboundCallTime: 0,
            OutboundCallTime: 0,
            InboundAcwTime: 0,
            OutboundAcwTime: 0,
            InboundHoldTime: 0,
            OutboundHoldTime: 0,
            OutboundAnswerCount: 0,
          };
          var inboundCallTime = format(
            "TOTALTIME:{0}:{1}:CONNECTED:{2}:CALLinbound",
            tenantId,
            companyId,
            resourceId
          );
          var staffedTime = format(
            "SESSION:{0}:{1}:{2}:LOGIN:{3}:{3}:Register",
            tenantId,
            companyId,
            bu,
            resourceId
          );
          var acwInbound = format(
            "TOTALTIME:{0}:{1}:AFTERWORK:{2}:AfterWorkCALLinbound",
            tenantId,
            companyId,
            resourceId
          );
          var acwOutbound = format(
            "TOTALTIME:{0}:{1}:AFTERWORK:{2}:AfterWorkCALLoutbound",
            tenantId,
            companyId,
            resourceId
          );
          var breakTime = format(
            "TOTALTIMEWSPARAM:{0}:{1}:BREAK:{2}",
            tenantId,
            companyId,
            resourceId
          );
          var incomingCallCount = format(
            "TOTALCOUNT:{0}:{1}:CONNECTED:{2}:CALLinbound",
            tenantId,
            companyId,
            resourceId
          );
          var missCallCount = format(
            "TOTALCOUNT:{0}:{1}:AGENTREJECT:*:{2}",
            tenantId,
            companyId,
            resourceId
          );
          var staffedTimeLastDay = format(
            "TOTALTIME:{0}:{1}:LOGIN:{2}:Register",
            tenantId,
            companyId,
            resourceId
          );
          var currentState = format(
            "ResourceState:{0}:{1}:{2}",
            companyId,
            tenantId,
            resourceId
          );
          var inboundHoldTime = format(
            "TOTALTIME:{0}:{1}:AGENTHOLD:{2}:inbound",
            tenantId,
            companyId,
            resourceId
          );
          var outboundHoldTime = format(
            "TOTALTIME:{0}:{1}:AGENTHOLD:{2}:outbound",
            tenantId,
            companyId,
            resourceId
          );
          var transferCount = format(
            "TOTALCOUNTWSPARAM:{0}:{1}:AGENTTRANSFER:{2}",
            tenantId,
            companyId,
            resourceId
          );
          var outboundCallTime = format(
            "TOTALTIME:{0}:{1}:CONNECTED:{2}:CALLoutbound",
            tenantId,
            companyId,
            resourceId
          );
          var outgoingCallCount = format(
            "TOTALCOUNT:{0}:{1}:CONNECTED:{2}:CALLoutbound",
            tenantId,
            companyId,
            resourceId
          );
          var outgoingAnswerCount = format(
            "TOTALCOUNT:{0}:{1}:CALLANSWERED:{2}:outbound",
            tenantId,
            companyId,
            resourceId
          );

          /* var transferCall = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");
                     var idleTime = "TOTALTIME:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "LOGIN", resourceId, "parameter2");
                     var holdTime = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");*/

          redisArdsClient.get(currentState, function (err, currentObj) {
            if (err) {
              logger.error("[TransferCallCount] - [%s]", id, err);
              var jsonString = messageFormatter.FormatMessage(
                err,
                "EXCEPTION",
                false,
                undefined
              );
              res.end(jsonString);
            } else {
              var keys = [
                inboundCallTime,
                acwInbound,
                acwOutbound,
                breakTime,
                incomingCallCount,
                inboundHoldTime,
                outboundHoldTime,
                transferCount,
                outboundCallTime,
                outgoingCallCount,
                outgoingAnswerCount,
              ];
              redisClient.mget(keys, function (err, reuslt) {
                if (err) {
                  console.log(err);
                } else {
                  var tempInboundOnCallTime = parseInt(
                    reuslt[0] ? reuslt[0] : 0
                  );
                  var tempOutboundOnCallTime = parseInt(
                    reuslt[8] ? reuslt[8] : 0
                  );
                  productivity.InboundAcwTime = parseInt(
                    reuslt[1] ? reuslt[1] : 0
                  );
                  productivity.OutboundAcwTime = parseInt(
                    reuslt[2] ? reuslt[2] : 0
                  );
                  productivity.InboundHoldTime = parseInt(
                    reuslt[5] ? reuslt[5] : 0
                  );
                  productivity.OutboundHoldTime = parseInt(
                    reuslt[6] ? reuslt[6] : 0
                  );

                  productivity.InboundCallTime =
                    tempInboundOnCallTime - productivity.InboundHoldTime;
                  productivity.OutboundCallTime =
                    tempOutboundOnCallTime - productivity.OutboundHoldTime;
                  productivity.OutboundAnswerCount = parseInt(
                    reuslt[10] ? reuslt[10] : 0
                  );
                  productivity.InboundCallTime =
                    productivity.InboundCallTime > 0
                      ? productivity.InboundCallTime
                      : 0;
                  productivity.OutboundCallTime =
                    productivity.OutboundCallTime > 0
                      ? productivity.OutboundCallTime
                      : 0;

                  productivity.OnCallTime =
                    productivity.InboundCallTime +
                    productivity.OutboundCallTime;
                  productivity.AcwTime =
                    productivity.InboundAcwTime + productivity.OutboundAcwTime;
                  productivity.BreakTime = parseInt(reuslt[3] ? reuslt[3] : 0);
                  productivity.IncomingCallCount = parseInt(
                    reuslt[4] ? reuslt[4] : 0
                  );
                  productivity.HoldTime =
                    productivity.InboundHoldTime +
                    productivity.OutboundHoldTime;
                  productivity.TransferCallCount = parseInt(
                    reuslt[7] ? reuslt[7] : 0
                  );
                  productivity.OutgoingCallCount = parseInt(
                    reuslt[9] ? reuslt[9] : 0
                  );
                  redisClient.hget(staffedTime, "time", function (err, reuslt) {
                    if (err) {
                      console.log(err);
                    } else {
                      try {
                        if (reuslt) {
                          var now = "04/09/2013 15:00:00";
                          var then = "04/09/2013 14:20:30";

                          var timetet = moment
                            .utc(
                              moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(
                                moment(moment(reuslt), "DD/MM/YYYY HH:mm:ss")
                              )
                            )
                            .format("HH:mm:ss");

                          var stfTime = moment
                            .utc(
                              moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(
                                moment(moment(reuslt), "DD/MM/YYYY HH:mm:ss")
                              )
                            )
                            .format("HH:mm:ss"); // split it at the colons
                          productivity.StaffedTime = toSeconds(stfTime);
                          var workTime = 0;
                          try {
                            /*var currentStateSpendTime = currentObj.StateChangeTime;*/
                            workTime =
                              parseInt(productivity.OnCallTime) +
                              parseInt(productivity.AcwTime) +
                              parseInt(productivity.BreakTime) +
                              parseInt(productivity.HoldTime);

                            var sTime = JSON.parse(currentObj);

                            /*
                                                         if( moment(sTime.StateChangeTime)>moment(reuslt)){
                                                         var currentStateSpendTime = moment.utc(moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(moment(sTime.StateChangeTime))).format("HH:mm:ss"); // split it at the colons
                                                         workTime = parseInt(workTime) + parseInt(toSeconds(currentStateSpendTime));
                                                         }*/
                          } catch (ex) {
                            console.log(err);
                          }
                          try {
                            redisClient.get(staffedTimeLastDay, function (
                              err,
                              reuslt
                            ) {
                              if (err) {
                                console.log(err);
                              } else {
                                if (reuslt) {
                                  try {
                                    /*sTime = moment.utc(moment(moment(),"DD/MM/YYYY HH:mm:ss").diff(moment(moment(reuslt),"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss"); // split it at the colons*/
                                    productivity.StaffedTime =
                                      parseInt(reuslt) +
                                      parseInt(productivity.StaffedTime);
                                    /*productivity.StaffedTime = parseInt(toSeconds(sTime)) + parseInt(productivity.StaffedTime);*/
                                  } catch (ex) {
                                    console.log(err);
                                  }
                                }
                                productivity.IdleTime =
                                  parseInt(productivity.StaffedTime) -
                                  parseInt(workTime);

                                redisClient.keys(missCallCount, function (
                                  err,
                                  ids
                                ) {
                                  if (err) {
                                    console.log(err);
                                  } else {
                                    redisClient.mget(ids, function (
                                      err,
                                      misscalls
                                    ) {
                                      try {
                                        productivity.MissCallCount = 0;
                                        productivity.MissCallCount = misscalls.reduce(
                                          function (pv, cv) {
                                            return parseInt(pv) + parseInt(cv);
                                          },
                                          0
                                        );
                                      } catch (ex) {}

                                      // if (req.query.productivityStartDate && req.query.productivityEndDate) {
                                      //     productivitySummary.GetFirstLoginForTheDate(resourceId, req.query.productivityStartDate, req.query.productivityEndDate).then(function (firstLoginRecord) {
                                      //         count++;
                                      //         productivity.LoginTime = firstLoginRecord ? firstLoginRecord.createdAt : undefined;
                                      //         AgentsProductivity.push(productivity);
                                      //         if (count == resourceIds.length) {
                                      //
                                      //             var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, AgentsProductivity);
                                      //             logger.info('[Productivity] . [%s] -[%s]', AgentsProductivity, jsonString);
                                      //             res.end(jsonString);
                                      //         }
                                      //     }).catch(function (err) {
                                      //         count++;
                                      //         AgentsProductivity.push(productivity);
                                      //         if (count == resourceIds.length) {
                                      //
                                      //             var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, AgentsProductivity);
                                      //             logger.info('[Productivity] . [%s] -[%s]', AgentsProductivity, jsonString);
                                      //             res.end(jsonString);
                                      //         }
                                      //
                                      //     });
                                      // } else {
                                      count++;
                                      AgentsProductivity.push(productivity);
                                      if (count == resourceIds.length) {
                                        var jsonString = messageFormatter.FormatMessage(
                                          undefined,
                                          "SUCCESS",
                                          true,
                                          AgentsProductivity
                                        );
                                        logger.info(
                                          "[Productivity] . [%s] -[%s]",
                                          AgentsProductivity,
                                          jsonString
                                        );
                                        res.end(jsonString);
                                      }
                                      //}
                                    });
                                  }
                                });
                              }
                            });
                          } catch (ex) {
                            console.log(err);
                          }
                        } else {
                          productivity.StaffedTime = 0;
                          productivity.IdleTime = 0;
                          var jsonString = messageFormatter.FormatMessage(
                            undefined,
                            "SUCCESS",
                            true,
                            AgentsProductivity
                          );
                          logger.info(
                            "[Productivity-miss some data1] . [%s] -[%s]",
                            AgentsProductivity,
                            jsonString
                          );
                          AgentsProductivity.push(productivity);
                          count++;
                          if (count == resourceIds.length) {
                            var jsonString = messageFormatter.FormatMessage(
                              undefined,
                              "SUCCESS",
                              true,
                              AgentsProductivity
                            );
                            logger.info(
                              "[Productivity] . [%s] -[%s]",
                              AgentsProductivity,
                              jsonString
                            );
                            res.end(jsonString);
                          }
                          //res.end(jsonString);
                        }
                      } catch (ex) {
                        console.log(ex);
                      }
                    }
                  });
                }
              });
            }
          });
        });
      } else {
        var jsonString = messageFormatter.FormatMessage(
          undefined,
          "No Registered Resource Found",
          true,
          []
        );
        logger.info("[Productivity] . [%s]", jsonString);
        res.end(jsonString);
      }
    }
  });
};

var getProductivityByResourceId = function (companyId, tenantId, resourceId) {};

function toSeconds(time) {
  var sTime = time.split(":"); // split it at the colons
  // minutes are worth 60 seconds. Hours are worth 60 minutes.
  return +sTime[0] * 60 * 60 + +sTime[1] * 60 + +sTime[2];
}

module.exports.ProductivityByResourceId = function (
  req,
  res,
  companyId,
  tenantId
) {
  var jsonString;
  var id = format("Resource:{0}:{1}:*", companyId, tenantId);

  var resourceId = req.params["ResourceId"];
  var bu = req.query.bu || "default";

  var productivity = {
    ResourceId: resourceId,
    AcwTime: 0,
    BreakTime: 0,
    OnCallTime: 0,
    StaffedTime: 0,
    IdleTime: 0,
    HoldTime: 0,
    IncomingCallCount: 0,
    OutgoingCallCount: 0,
    TransferCallCount: 0,
    MissCallCount: 0,
    InboundCallTime: 0,
    OutboundCallTime: 0,
    InboundAcwTime: 0,
    OutboundAcwTime: 0,
    InboundHoldTime: 0,
    OutboundHoldTime: 0,
  };
  var inboundCallTime = format(
    "TOTALTIME:{0}:{1}:CONNECTED:{2}:CALLinbound",
    tenantId,
    companyId,
    resourceId
  );
  var staffedTime = format(
    "SESSION:{0}:{1}:{2}:LOGIN:{3}:{3}:Register",
    tenantId,
    companyId,
    bu,
    resourceId
  );
  var acwInbound = format(
    "TOTALTIME:{0}:{1}:AFTERWORK:{2}:AfterWorkCALLinbound",
    tenantId,
    companyId,
    resourceId
  );
  var acwOutbound = format(
    "TOTALTIME:{0}:{1}:AFTERWORK:{2}:AfterWorkCALLoutbound",
    tenantId,
    companyId,
    resourceId
  );
  var breakTime = format(
    "TOTALTIMEWSPARAM:{0}:{1}:BREAK:{2}",
    tenantId,
    companyId,
    resourceId
  );
  var incomingCallCount = format(
    "TOTALCOUNT:{0}:{1}:CONNECTED:{2}:CALLinbound",
    tenantId,
    companyId,
    resourceId
  );
  var missCallCount = format(
    "TOTALCOUNT:{0}:{1}:AGENTREJECT:*:{2}",
    tenantId,
    companyId,
    resourceId
  );
  var staffedTimeLastDay = format(
    "TOTALTIME:{0}:{1}:LOGIN:{2}:Register",
    tenantId,
    companyId,
    resourceId
  );
  var currentState = format(
    "ResourceState:{0}:{1}:{2}",
    companyId,
    tenantId,
    resourceId
  );
  var inboundHoldTime = format(
    "TOTALTIME:{0}:{1}:AGENTHOLD:{2}:inbound",
    tenantId,
    companyId,
    resourceId
  );
  var outboundHoldTime = format(
    "TOTALTIME:{0}:{1}:AGENTHOLD:{2}:outbound",
    tenantId,
    companyId,
    resourceId
  );
  var transferCount = format(
    "TOTALCOUNTWSPARAM:{0}:{1}:AGENTTRANSFER:{2}",
    tenantId,
    companyId,
    resourceId
  );
  var outboundCallTime = format(
    "TOTALTIME:{0}:{1}:CONNECTED:{2}:CALLoutbound",
    tenantId,
    companyId,
    resourceId
  );
  var outgoingCallCount = format(
    "TOTALCOUNT:{0}:{1}:CONNECTED:{2}:CALLoutbound",
    tenantId,
    companyId,
    resourceId
  );

  /* var transferCall = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");
     var idleTime = "TOTALTIME:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "LOGIN", resourceId, "parameter2");
     var holdTime = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");*/

  redisArdsClient.get(currentState, function (err, currentObj) {
    if (err) {
      logger.error("[TransferCallCount] - [%s]", id, err);
      jsonString = messageFormatter.FormatMessage(
        err,
        "EXCEPTION",
        false,
        undefined
      );
      res.end(jsonString);
    } else {
      var keys = [
        inboundCallTime,
        acwInbound,
        acwOutbound,
        breakTime,
        incomingCallCount,
        inboundHoldTime,
        outboundHoldTime,
        transferCount,
        outboundCallTime,
        outgoingCallCount,
      ];
      redisClient.mget(keys, function (err, reuslt) {
        if (err) {
          console.log(err);
        } else {
          var tempInboundOnCallTime = parseInt(reuslt[0] ? reuslt[0] : 0);
          var tempOutboundOnCallTime = parseInt(reuslt[8] ? reuslt[8] : 0);
          productivity.InboundAcwTime = parseInt(reuslt[1] ? reuslt[1] : 0);
          productivity.OutboundAcwTime = parseInt(reuslt[2] ? reuslt[2] : 0);
          productivity.InboundHoldTime = parseInt(reuslt[5] ? reuslt[5] : 0);
          productivity.OutboundHoldTime = parseInt(reuslt[6] ? reuslt[6] : 0);

          productivity.InboundCallTime =
            tempInboundOnCallTime - productivity.InboundHoldTime;
          productivity.OutboundCallTime =
            tempOutboundOnCallTime - productivity.OutboundHoldTime;
          productivity.InboundCallTime =
            productivity.InboundCallTime > 0 ? productivity.InboundCallTime : 0;
          productivity.OutboundCallTime =
            productivity.OutboundCallTime > 0
              ? productivity.OutboundCallTime
              : 0;

          productivity.OnCallTime =
            productivity.InboundCallTime + productivity.OutboundCallTime;
          productivity.AcwTime =
            productivity.InboundAcwTime + productivity.OutboundAcwTime;
          productivity.BreakTime = parseInt(reuslt[3] ? reuslt[3] : 0);
          productivity.IncomingCallCount = parseInt(reuslt[4] ? reuslt[4] : 0);
          productivity.HoldTime =
            productivity.InboundHoldTime + productivity.OutboundHoldTime;
          productivity.TransferCallCount = parseInt(reuslt[7] ? reuslt[7] : 0);
          productivity.OutgoingCallCount = parseInt(reuslt[9] ? reuslt[9] : 0);
          redisClient.hget(staffedTime, "time", function (err, reuslt) {
            if (err) {
              jsonString = messageFormatter.FormatMessage(
                undefined,
                "SUCCESS",
                true,
                productivity
              );
              logger.error("[TransferCallCount] - [%s]", id, err);
              res.end(jsonString);
            } else {
              try {
                if (reuslt) {
                  var stfTime = moment
                    .utc(
                      moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(
                        moment(moment(reuslt), "DD/MM/YYYY HH:mm:ss")
                      )
                    )
                    .format("HH:mm:ss"); // split it at the colons
                  productivity.StaffedTime = toSeconds(stfTime);
                  var workTime = 0;
                  try {
                    /*var currentStateSpendTime = currentObj.StateChangeTime;*/
                    workTime =
                      parseInt(productivity.OnCallTime) +
                      parseInt(productivity.AcwTime) +
                      parseInt(productivity.BreakTime) +
                      parseInt(productivity.HoldTime);

                    /*
                                         if( moment(sTime.StateChangeTime)>moment(reuslt)){
                                         var currentStateSpendTime = moment.utc(moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(moment(sTime.StateChangeTime))).format("HH:mm:ss"); // split it at the colons
                                         workTime = parseInt(workTime) + parseInt(toSeconds(currentStateSpendTime));
                                         }*/
                  } catch (ex) {
                    console.log(err);
                  }
                  try {
                    redisClient.get(staffedTimeLastDay, function (err, reuslt) {
                      if (err) {
                        console.log(err);
                      } else {
                        if (reuslt) {
                          try {
                            /*sTime = moment.utc(moment(moment(),"DD/MM/YYYY HH:mm:ss").diff(moment(moment(reuslt),"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss"); // split it at the colons*/
                            productivity.StaffedTime =
                              parseInt(reuslt) +
                              parseInt(productivity.StaffedTime);
                            /*productivity.StaffedTime = parseInt(toSeconds(sTime)) + parseInt(productivity.StaffedTime);*/
                          } catch (ex) {
                            console.log(err);
                          }
                        }
                        productivity.IdleTime =
                          parseInt(productivity.StaffedTime) -
                          parseInt(workTime);

                        redisClient.keys(missCallCount, function (err, ids) {
                          if (err) {
                            console.log(err);
                          } else {
                            redisClient.mget(ids, function (err, misscalls) {
                              try {
                                productivity.MissCallCount = 0;
                                productivity.MissCallCount = misscalls.reduce(
                                  function (pv, cv) {
                                    return parseInt(pv) + parseInt(cv);
                                  },
                                  0
                                );
                              } catch (ex) {}

                              jsonString = messageFormatter.FormatMessage(
                                undefined,
                                "SUCCESS",
                                true,
                                productivity
                              );
                              logger.info(
                                "[Productivity] . [%s] -[%s]",
                                productivity,
                                jsonString
                              );
                              res.end(jsonString);
                            });
                          }
                        });
                      }
                    });
                  } catch (ex) {
                    console.log(err);
                  }
                } else {
                  productivity.StaffedTime = 0;
                  productivity.IdleTime = 0;
                  jsonString = messageFormatter.FormatMessage(
                    undefined,
                    "SUCCESS",
                    true,
                    productivity
                  );
                  logger.info(
                    "[Productivity-miss some data1] . [%s] -[%s]",
                    productivity,
                    jsonString
                  );
                  res.end(jsonString);
                }
              } catch (ex) {
                jsonString = messageFormatter.FormatMessage(
                  undefined,
                  "SUCCESS",
                  true,
                  productivity
                );
                logger.error("[TransferCallCount] - [%s]", id, ex);
                res.end(jsonString);
              }
            }
          });
        }
      });
    }
  });
};

module.exports.GetTransferCallCount = function (req, res, companyId, tenantId) {
  var resourceId = req.params["ResourceId"];
  var key = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(
    tenantId,
    companyId,
    "window",
    resourceId,
    "parameter2"
  );
  redisClient.get(key, function (err, reuslt) {
    if (err) {
      logger.error("[TransferCallCount] - [%s]", key, err);
      var jsonString = messageFormatter.FormatMessage(
        err,
        "EXCEPTION",
        false,
        undefined
      );
      res.end(jsonString);
    } else {
      var jsonString = messageFormatter.FormatMessage(
        undefined,
        "SUCCESS",
        true,
        reuslt
      );
      logger.info("[TransferCallCount] . [%s] -[%s]", key, jsonString);
      res.end(jsonString);
    }
  });
};

module.exports.GetIncomingCallCount = function (req, res, companyId, tenantId) {
  var resourceId = req.params["ResourceId"];
  var key = format(
    "TOTALCOUNT:{0}:{1}:CONNECTED:{2}:param2",
    tenantId,
    companyId,
    resourceId
  );
  redisClient.get(key, function (err, reuslt) {
    if (err) {
      logger.error("[IncomingCallCount] - [%s]", key, err);
      var jsonString = messageFormatter.FormatMessage(
        err,
        "EXCEPTION",
        false,
        undefined
      );
      res.end(jsonString);
    } else {
      var jsonString = messageFormatter.FormatMessage(
        undefined,
        "SUCCESS",
        true,
        reuslt
      );
      logger.info("[IncomingCallCount] . [%s] -[%s]", key, jsonString);
      res.end(jsonString);
    }
  });
};

module.exports.GetMissCallCount = function (req, res, companyId, tenantId) {
  var resourceId = req.params["ResourceId"];
  var key = format(
    "TOTALCOUNT:{0}:{1}:AGENTREJECT:*:{2}",
    tenantId,
    companyId,
    resourceId
  );

  redisClient.get(key, function (err, reuslt) {
    if (err) {
      logger.error("[MissCallCount] - [%s]", key, err);
      var jsonString = messageFormatter.FormatMessage(
        err,
        "EXCEPTION",
        false,
        undefined
      );
      res.end(jsonString);
    } else {
      redisClient.hmget(reuslt[5], function (err, misscalls) {
        if (err) {
          logger.error("[MissCallCount] - [%s]", key, err);
          var jsonString = messageFormatter.FormatMessage(
            err,
            "EXCEPTION",
            false,
            undefined
          );
          res.end(jsonString);
        } else {
          var missCallCount = misscalls.reduce(function (pv, cv) {
            return parseInt(pv) + parseInt(cv);
          }, 0);
          var jsonString = messageFormatter.FormatMessage(
            undefined,
            "SUCCESS",
            true,
            missCallCount
          );
          logger.info("[MissCallCount] . [%s] -[%s]", key, jsonString);
          res.end(jsonString);
        }
      });
    }
  });
};

module.exports.GetHoldTime = function (req, res, companyId, tenantId) {
  var resourceId = req.params["ResourceId"];
  var key = resourceId;
  redisClient.get(key, function (err, reuslt) {
    if (err) {
      logger.error("[HoldTime] - [%s]", key, err);
      var jsonString = messageFormatter.FormatMessage(
        err,
        "EXCEPTION",
        false,
        undefined
      );
      res.end(jsonString);
    } else {
      var jsonString = messageFormatter.FormatMessage(
        undefined,
        "SUCCESS",
        true,
        reuslt
      );
      logger.info("[HoldTime] . [%s] -[%s]", key, jsonString);
      res.end(jsonString);
    }
  });
};

module.exports.GetIdleTime = function (req, res, companyId, tenantId) {
  var resourceId = req.params["ResourceId"];
  var key = resourceId;
  redisClient.get(key, function (err, reuslt) {
    if (err) {
      logger.error("[IdleTime] - [%s]", key, err);
      var jsonString = messageFormatter.FormatMessage(
        err,
        "EXCEPTION",
        false,
        undefined
      );
      res.end(jsonString);
    } else {
      var jsonString = messageFormatter.FormatMessage(
        undefined,
        "SUCCESS",
        true,
        reuslt
      );
      logger.info("[IdleTime] . [%s] -[%s]", key, jsonString);
      res.end(jsonString);
    }
  });
};

module.exports.GetStaffedTime = function (req, res, companyId, tenantId) {
  var resourceId = req.params["ResourceId"];
  var key = format(
    "SESSION:{0}:{1}:LOGIN:{2}:{2}:param2",
    tenantId,
    companyId,
    resourceId
  );
  redisClient.get(key, function (err, reuslt) {
    if (err) {
      logger.error("[StaffedTime] - [%s]", key, err);
      var jsonString = messageFormatter.FormatMessage(
        err,
        "EXCEPTION",
        false,
        undefined
      );
      res.end(jsonString);
    } else {
      var sTime = moment
        .utc(
          moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(
            moment(reuslt, "DD/MM/YYYY HH:mm:ss")
          )
        )
        .format("HH:mm:ss");
      var jsonString = messageFormatter.FormatMessage(
        undefined,
        "SUCCESS",
        true,
        sTime
      );
      logger.info("[StaffedTime] . [%s] -[%s]", key, jsonString);
      res.end(jsonString);
    }
  });
};

module.exports.GetOnCallTime = function (req, res, companyId, tenantId) {
  var resourceId = req.params["ResourceId"];
  var key = format(
    "TOTALTIME:{0}:{1}:CONNECTED:{2}:param2",
    tenantId,
    companyId,
    resourceId
  );
  redisClient.get(key, function (err, reuslt) {
    if (err) {
      logger.error("[OnCallTime] - [%s]", key, err);
      var jsonString = messageFormatter.FormatMessage(
        err,
        "EXCEPTION",
        false,
        undefined
      );
      res.end(jsonString);
    } else {
      var jsonString = messageFormatter.FormatMessage(
        undefined,
        "SUCCESS",
        true,
        reuslt
      );
      logger.info("[OnCallTime] . [%s] -[%s]", key, jsonString);
      res.end(jsonString);
    }
  });
};

module.exports.GetBreakTime = function (req, res, companyId, tenantId) {
  var resourceId = req.params["ResourceId"];
  var key = format(
    "TOTALTIME:{0}:{1}:BREAK:{2}:param2",
    tenantId,
    companyId,
    resourceId
  );
  redisClient.get(key, function (err, reuslt) {
    if (err) {
      logger.error("[BreakTime] - [%s]", key, err);
      var jsonString = messageFormatter.FormatMessage(
        err,
        "EXCEPTION",
        false,
        undefined
      );
      res.end(jsonString);
    } else {
      var jsonString = messageFormatter.FormatMessage(
        undefined,
        "SUCCESS",
        true,
        reuslt
      );
      logger.info("[BreakTime] . [%s] -[%s]", key, jsonString);
      res.end(jsonString);
    }
  });
};

module.exports.GetAcwTime = function (req, res, companyId, tenantId) {
  var resourceId = req.params["ResourceId"];
  var key;
  var jsonString;

  if (req.query && req.query.direction === "outbound") {
    key = format(
      "TOTALTIME:{0}:{1}:AFTERWORK:{2}:AfterWorkCALLoutbound",
      tenantId,
      companyId,
      resourceId
    );
  } else {
    key = format(
      "TOTALTIME:{0}:{1}:AFTERWORK:{2}:AfterWorkCALLinbound",
      tenantId,
      companyId,
      resourceId
    );
  }
  redisClient.get(key, function (err, reuslt) {
    if (err) {
      logger.error("[GetAcwTime] - [%s]", key, err);
      jsonString = messageFormatter.FormatMessage(
        err,
        "EXCEPTION",
        false,
        undefined
      );
      res.end(jsonString);
    } else {
      jsonString = messageFormatter.FormatMessage(
        undefined,
        "SUCCESS",
        true,
        reuslt
      );
      logger.info("[GetAcwTime] . [%s] -[%s]", key, jsonString);
      res.end(jsonString);
    }
  });
};

module.exports.redisArdsClient = redisArdsClient;
