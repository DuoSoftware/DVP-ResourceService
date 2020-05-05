/**
 * Created by Waruna on 1/18/2018.
 */

var config = require('config');
var redis = require("ioredis");
/* ----------------------- ArdsRedis configurations ------------------------------ */
var ardsredisip = config.ArdsRedis.ip;
var ardsredisport = config.ArdsRedis.port;
var ardsredispass = config.ArdsRedis.password;
var ardsredismode = config.ArdsRedis.mode;
var ardsredisdb = config.ArdsRedis.db;


var redisArdsSetting = {
    port: ardsredisport,
    host: ardsredisip,
    family: 4,
    db: ardsredisdb,
    retryStrategy: function (times) {
        var delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError: function (err) {

        return true;
    }
};

if (ardsredispass != "") redisArdsSetting.password = ardsredispass;

var redisArdsClient = undefined;

if (redismode != "cluster") {
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
                db: ardsredisdb
            }
            if (ardsredispass != "") redisConf.password = ardsredispass;
            redisArdsSetting.push(redisConf);
        });

        

        var redisArdsClient = new redis.Cluster([redisArdsSetting]);

    } else {

        redisArdsClient = new redis(redisArdsSetting);
    }


}
//**** ards data con
redisArdsClient.auth(config.ArdsRedis.password, function (err) {
    /*if (err)
     throw err;*/
    console.log("Redis[ARDS] Auth error  " + err);
});

redisArdsClient.on("error", function (err) {
    console.log("Redis[ARDS] connection error  " + err);
});

redisArdsClient.on("connect", function (err) {
});
/* ----------------------- ArdsRedis configurations End ------------------------------ */

var UserAccount = require('dvp-mongomodels/model/UserAccount');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var productivitySummary = require('./ProductivitySummaryHandler');

module.exports.GetConsolidatedProductivity = function (req, res) {

    var company = parseInt(req.user.company);
    var tenant = parseInt(req.user.tenant);
    var jsonString;

    UserAccount.find({company: company, tenant: tenant, verified: true, active: true})
        .select("-user_scopes, -client_scopes")
        .exec(function (err, users) {
                if (err) {

                    jsonString = messageFormatter.FormatMessage(err, "Failed Get Users List.", false, undefined);
                    res.end(jsonString);

                } else {
                    if (users) {
                        var AgentsProductivity = {};

                        function addToProductivity(userName, data) {
                            var tempProductivity = AgentsProductivity[userName];
                            if (tempProductivity) {

                                tempProductivity.LoginTime = tempProductivity.LoginTime + data.LoginTime;
                                tempProductivity.AcwTime = tempProductivity.AcwTime + data.AcwTime;
                                tempProductivity.BreakTime = tempProductivity.BreakTime + data.BreakTime;
                                tempProductivity.OnCallTime = tempProductivity.OnCallTime + data.OnCallTime;
                                tempProductivity.StaffedTime = tempProductivity.StaffedTime + data.StaffedTime;
                                tempProductivity.IdleTime = tempProductivity.IdleTime + data.IdleTime;
                                tempProductivity.HoldTime = tempProductivity.HoldTime + data.HoldTime;
                                tempProductivity.IncomingCallCount = tempProductivity.IncomingCallCount + data.IncomingCallCount;
                                tempProductivity.OutgoingCallCount = tempProductivity.OutgoingCallCount + data.OutgoingCallCount;
                                tempProductivity.TransferCallCount = tempProductivity.TransferCallCount + data.TransferCallCount;
                                tempProductivity.MissCallCount = tempProductivity.MissCallCount + data.MissCallCount;
                                tempProductivity.InboundCallTime = tempProductivity.InboundCallTime + data.InboundCallTime;
                                tempProductivity.OutboundCallTime = tempProductivity.OutboundCallTime + data.OutboundCallTime;
                                tempProductivity.InboundAcwTime = tempProductivity.InboundAcwTime + data.InboundAcwTime;
                                tempProductivity.OutboundAcwTime = tempProductivity.OutboundAcwTime + data.OutboundAcwTime;
                                tempProductivity.InboundHoldTime = tempProductivity.InboundHoldTime + data.InboundHoldTime;
                                tempProductivity.OutboundHoldTime = tempProductivity.OutboundHoldTime + data.OutboundHoldTime;
                                tempProductivity.OutboundAnswerCount = tempProductivity.OutboundAnswerCount + data.OutboundAnswerCount;
                            }
                            else {
                                AgentsProductivity[userName] = data;
                            }
                        }

                        users.forEach(function (consolidatedUser) {
                            if (consolidatedUser && consolidatedUser.resource_id) {
                                var resId = consolidatedUser.resource_id;

                                var tenantId = consolidatedUser.tenant;
                                var companyId = consolidatedUser.company;
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
                                    OutboundAnswerCount: 0
                                };
                                var inboundCallTime = format("TOTALTIME:{0}:{1}:CONNECTED:{2}:CALLinbound", tenantId, companyId, resourceId);
                                var staffedTime = format("SESSION:{0}:{1}:LOGIN:{2}:{2}:Register", tenantId, companyId, resourceId);
                                var acwInbound = format("TOTALTIME:{0}:{1}:AFTERWORK:{2}:AfterWorkCALLinbound", tenantId, companyId, resourceId);
                                var acwOutbound = format("TOTALTIME:{0}:{1}:AFTERWORK:{2}:AfterWorkCALLoutbound", tenantId, companyId, resourceId);
                                var breakTime = format("TOTALTIMEWSPARAM:{0}:{1}:BREAK:{2}", tenantId, companyId, resourceId);
                                var incomingCallCount = format("TOTALCOUNT:{0}:{1}:CONNECTED:{2}:CALLinbound", tenantId, companyId, resourceId);
                                var missCallCount = format("TOTALCOUNT:{0}:{1}:AGENTREJECT:*:{2}", tenantId, companyId, resourceId);
                                var staffedTimeLastDay = format("TOTALTIME:{0}:{1}:LOGIN:{2}:Register", tenantId, companyId, resourceId);
                                var currentState = format("ResourceState:{0}:{1}:{2}", companyId, tenantId, resourceId);
                                var inboundHoldTime = format("TOTALTIME:{0}:{1}:AGENTHOLD:{2}:inbound", tenantId, companyId, resourceId);
                                var outboundHoldTime = format("TOTALTIME:{0}:{1}:AGENTHOLD:{2}:outbound", tenantId, companyId, resourceId);
                                var transferCount = format("TOTALCOUNTWSPARAM:{0}:{1}:AGENTTRANSFER:{2}", tenantId, companyId, resourceId);
                                var outboundCallTime = format("TOTALTIME:{0}:{1}:CONNECTED:{2}:CALLoutbound", tenantId, companyId, resourceId);
                                var outgoingCallCount = format("TOTALCOUNT:{0}:{1}:CONNECTED:{2}:CALLoutbound", tenantId, companyId, resourceId);
                                var outgoingAnswerCount = format("TOTALCOUNT:{0}:{1}:CALLANSWERED:{2}:outbound", tenantId, companyId, resourceId);

                                /* var transferCall = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");
                                 var idleTime = "TOTALTIME:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "LOGIN", resourceId, "parameter2");
                                 var holdTime = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");*/

                                redisArdsClient.get(currentState, function (err, currentObj) {
                                    if (err) {
                                        logger.error('[TransferCallCount] - [%s]', id, err);
                                        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                                        res.end(jsonString);
                                    }
                                    else {


                                        var keys = [inboundCallTime, acwInbound, acwOutbound, breakTime, incomingCallCount, inboundHoldTime, outboundHoldTime, transferCount, outboundCallTime, outgoingCallCount, outgoingAnswerCount];
                                        redisClient.mget(keys, function (err, reuslt) {
                                            if (err) {
                                                console.log(err);
                                            }
                                            else {
                                                var tempInboundOnCallTime = parseInt(reuslt[0] ? reuslt[0] : 0);
                                                var tempOutboundOnCallTime = parseInt(reuslt[8] ? reuslt[8] : 0);
                                                productivity.InboundAcwTime = parseInt(reuslt[1] ? reuslt[1] : 0);
                                                productivity.OutboundAcwTime = parseInt(reuslt[2] ? reuslt[2] : 0);
                                                productivity.InboundHoldTime = parseInt(reuslt[5] ? reuslt[5] : 0);
                                                productivity.OutboundHoldTime = parseInt(reuslt[6] ? reuslt[6] : 0);

                                                productivity.InboundCallTime = tempInboundOnCallTime - productivity.InboundHoldTime;
                                                productivity.OutboundCallTime = tempOutboundOnCallTime - productivity.OutboundHoldTime;
                                                productivity.OutboundAnswerCount = parseInt(reuslt[10] ? reuslt[10] : 0);
                                                productivity.InboundCallTime = (productivity.InboundCallTime > 0) ? productivity.InboundCallTime : 0;
                                                productivity.OutboundCallTime = (productivity.OutboundCallTime > 0) ? productivity.OutboundCallTime : 0;

                                                productivity.OnCallTime = productivity.InboundCallTime + productivity.OutboundCallTime;
                                                productivity.AcwTime = productivity.InboundAcwTime + productivity.OutboundAcwTime;
                                                productivity.BreakTime = parseInt(reuslt[3] ? reuslt[3] : 0);
                                                productivity.IncomingCallCount = parseInt(reuslt[4] ? reuslt[4] : 0);
                                                productivity.HoldTime = productivity.InboundHoldTime + productivity.OutboundHoldTime;
                                                productivity.TransferCallCount = parseInt(reuslt[7] ? reuslt[7] : 0);
                                                productivity.OutgoingCallCount = parseInt(reuslt[9] ? reuslt[9] : 0);
                                                redisClient.hget(staffedTime, "time", function (err, reuslt) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    else {
                                                        try {

                                                            if (reuslt) {

                                                                var now = "04/09/2013 15:00:00";
                                                                var then = "04/09/2013 14:20:30";

                                                                var timetet = moment.utc(moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(moment(moment(reuslt), "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");

                                                                var stfTime = moment.utc(moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(moment(moment(reuslt), "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss"); // split it at the colons
                                                                productivity.StaffedTime = toSeconds(stfTime);
                                                                var workTime = 0;
                                                                try {
                                                                    /*var currentStateSpendTime = currentObj.StateChangeTime;*/
                                                                    workTime = parseInt(productivity.OnCallTime) + parseInt(productivity.AcwTime) + parseInt(productivity.BreakTime) + parseInt(productivity.HoldTime);

                                                                    var sTime = JSON.parse(currentObj);

                                                                    /*
                                                                     if( moment(sTime.StateChangeTime)>moment(reuslt)){
                                                                     var currentStateSpendTime = moment.utc(moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(moment(sTime.StateChangeTime))).format("HH:mm:ss"); // split it at the colons
                                                                     workTime = parseInt(workTime) + parseInt(toSeconds(currentStateSpendTime));
                                                                     }*/


                                                                }
                                                                catch (ex) {
                                                                    console.log(err);
                                                                }
                                                                try {
                                                                    redisClient.get(staffedTimeLastDay, function (err, reuslt) {
                                                                        if (err) {
                                                                            console.log(err);
                                                                        }
                                                                        else {
                                                                            if (reuslt) {
                                                                                try {
                                                                                    /*sTime = moment.utc(moment(moment(),"DD/MM/YYYY HH:mm:ss").diff(moment(moment(reuslt),"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss"); // split it at the colons*/
                                                                                    productivity.StaffedTime = parseInt(reuslt) + parseInt(productivity.StaffedTime);
                                                                                    /*productivity.StaffedTime = parseInt(toSeconds(sTime)) + parseInt(productivity.StaffedTime);*/
                                                                                }
                                                                                catch (ex) {
                                                                                    console.log(err);
                                                                                }
                                                                            }
                                                                            productivity.IdleTime = parseInt(productivity.StaffedTime) - parseInt(workTime);

                                                                            redisClient.keys(missCallCount, function (err, ids) {
                                                                                if (err) {
                                                                                    console.log(err);
                                                                                }
                                                                                else {
                                                                                    redisClient.mget(ids, function (err, misscalls) {

                                                                                        try {
                                                                                            productivity.MissCallCount = 0;
                                                                                            productivity.MissCallCount = misscalls.reduce(function (pv, cv) {
                                                                                                return parseInt(pv) + parseInt(cv);
                                                                                            }, 0);
                                                                                        } catch (ex) {
                                                                                        }

                                                                                        if (req.query.productivityStartDate && req.query.productivityEndDate) {
                                                                                            productivitySummary.GetFirstLoginForTheDate(resourceId, req.query.productivityStartDate, req.query.productivityEndDate).then(function (firstLoginRecord) {
                                                                                                productivity.LoginTime = firstLoginRecord ? firstLoginRecord.createdAt : undefined;
                                                                                                addToProductivity(consolidatedUser.user, productivity);
                                                                                            }).catch(function (err) {
                                                                                                addToProductivity(consolidatedUser.user, productivity);
                                                                                            });
                                                                                        } else {
                                                                                            addToProductivity(consolidatedUser.user, productivity);
                                                                                        }

                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                } catch (ex) {
                                                                    console.log(err);
                                                                }
                                                            }
                                                            else {
                                                                productivity.StaffedTime = 0;
                                                                productivity.IdleTime = 0;
                                                                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, AgentsProductivity);
                                                                logger.info('[Productivity-miss some data1] . [%s] -[%s]', AgentsProductivity, jsonString);
                                                                addToProductivity(consolidatedUser.user, productivity);
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
                            }
                        });

                    }
                    else {

                        jsonString = messageFormatter.FormatMessage(undefined, "No Users", false, undefined);
                        res.end(jsonString);
                    }
                }


            }
        )
    ;

}
;