/**
 * Created by Administrator on 3/21/2016.
 */

var format = require('stringformat');
var config = require('config');
var redis = require('redis');
var redisip = config.Redis.ip;
var redisport = config.Redis.port;
var redisClient = redis.createClient(redisport, redisip);
var redisardsClient = redis.createClient(redisport, redisip);
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
/*var format = require('string-format');*/
var moment = require('moment');


redisClient.auth(config.Redis.password, function (err) {
    /*if (err)
     throw err;*/
    console.log("Redis Auth error  " + err);
});

redisClient.on("error", function (err) {
    console.log("Redis connection error  " + err);
});

redisClient.on("connect", function (err) {
    redisClient.select(config.Redis.redisdb, redis.print);
});

//**** ards data con
redisardsClient.auth(config.Redis.password, function (err) {
    /*if (err)
     throw err;*/
    console.log("Redis[ARDS] Auth error  " + err);
});

redisardsClient.on("error", function (err) {
    console.log("Redis[ARDS] connection error  " + err);
});

redisardsClient.on("connect", function (err) {
    redisardsClient.select(config.Redis.ardsData, redis.print);
});


module.exports.Productivity = function (req, res, companyId, tenantId) {


    var AgentsProductivity = [];
    var id = format("Resource:{0}:{1}:*", companyId, tenantId);

    function toSeconds(time) {
        var sTime = time.split(':'); // split it at the colons
        // minutes are worth 60 seconds. Hours are worth 60 minutes.
        return (+sTime[0]) * 60 * 60 + (+sTime[1]) * 60 + (+sTime[2]);
    }

    redisardsClient.keys(id, function (err, resourceIds) {
        if (err) {
            logger.error('[TransferCallCount] - [%s]', id, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else {
            console.log(resourceIds);
            console.log("-------------------------");
            var count = 0;
            resourceIds.forEach(function (resId) {

                //Resource:3:1:1
                var resourceId = resId.split(":")[3];

                var productivity = {
                    ResourceId: resourceId,
                    AcwTime: 0,
                    BreakTime: 0,
                    OnCallTime: 0,
                    StaffedTime: 0,
                    IdleTime: 0,
                    HoldTime: 0,
                    IncomingCallCount: 0,
                    TransferCallCount: 0,
                    MissCallCount: 0
                };
                var callTime = format("TOTALTIME:{0}:{1}:CONNECTED:{2}:param2", tenantId, companyId, resourceId);
                var staffedTime = format("SESSION:{0}:{1}:LOGIN:{2}:{2}:param2", tenantId, companyId, resourceId);
                var acw = format("TOTALTIME:{0}:{1}:AFTERWORK:{2}:param2", tenantId, companyId, resourceId);
                var breakTime = format("TOTALTIME:{0}:{1}:BREAK:{2}:param2", tenantId, companyId, resourceId);
                var incomingCallCount = format("TOTALCOUNT:{0}:{1}:CONNECTED:{2}:param2", tenantId, companyId, resourceId);
                var missCallCount = format("TOTALCOUNT:{0}:{1}:AGENTREJECT:*:{2}", tenantId, companyId, resourceId);
                var staffedTimeLastDay = format("TOTALTIME:{0}:{1}:LOGIN:{2}:param2", tenantId, companyId, resourceId);
                var currentState = format("ResourceState:{0}:{1}:{2}", companyId, tenantId, resourceId);

                /* var transferCall = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");
                 var idleTime = "TOTALTIME:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "LOGIN", resourceId, "parameter2");
                 var holdTime = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");*/

                redisardsClient.get(currentState, function (err, currentObj) {
                    if (err) {
                        logger.error('[TransferCallCount] - [%s]', id, err);
                        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                        res.end(jsonString);
                    }
                    else {


                        var keys = [callTime, acw, breakTime, incomingCallCount];
                        redisClient.mget(keys, function (err, reuslt) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                productivity.OnCallTime = reuslt[0] ? reuslt[0] : 0;
                                productivity.AcwTime = reuslt[1] ? reuslt[1] : 0;
                                productivity.BreakTime = reuslt[2] ? reuslt[2] : 0;
                                productivity.IncomingCallCount = reuslt[3] ? reuslt[3] : 0;
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
                                                    workTime = parseInt(productivity.OnCallTime) + parseInt(productivity.AcwTime) + parseInt(productivity.BreakTime);

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
                                                                        count++;
                                                                        try {
                                                                            productivity.MissCallCount = 0;
                                                                            productivity.MissCallCount = misscalls.reduce(function (pv, cv) {
                                                                                return parseInt(pv) + parseInt(cv);
                                                                            }, 0);
                                                                        } catch (ex) {
                                                                        }
                                                                        AgentsProductivity.push(productivity);
                                                                        if (count == resourceIds.length) {

                                                                            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, AgentsProductivity);
                                                                            logger.info('[Productivity] . [%s] -[%s]', AgentsProductivity, jsonString);
                                                                            res.end(jsonString);
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
                                                AgentsProductivity.push(productivity);
                                                count++;
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

        }
    });
};

var getProductivityByResourceId = function (companyId, tenantId, resourceId) {


};

module.exports.ProductivityByResourceId = function (req, res, companyId, tenantId) {

    var productivity = {
        AcwTime: 0,
        BreakTime: 0,
        OnCallTime: 0,
        StaffedTime: 0,
        IdleTime: 0,
        HoldTime: 0,
        IncomingCallCount: 0,
        TransferCallCount: 0,
        MissCallCount: 0
    };
    var resourceId = req.params["ResourceId"];

    var callTime = format("TOTALTIME:{0}:{1}:CONNECTED:{2}:param2", tenantId, companyId, resourceId);
    var staffedTime = format("SESSION:{0}:{1}:LOGIN:{2}:{2}:param2", tenantId, companyId, resourceId);
    var acw = format("TOTALTIME:{0}:{1}:AFTERWORK:{2}:param2", tenantId, companyId, resourceId);
    var breakTime = format("TOTALTIME:{0}:{1}:BREAK:{2}:param2", tenantId, companyId, resourceId);
    var incomingCallCount = format("TOTALCOUNT:{0}:{1}:CONNECTED:{2}:param2", tenantId, companyId, resourceId);
    var missCallCount = format("TOTALCOUNT:{0}:{1}:AGENTREJECT:*:{2}", tenantId, companyId, resourceId);


    /* var transferCall = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");
     var idleTime = "TOTALTIME:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "LOGIN", resourceId, "parameter2");
     var holdTime = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");*/

    var keys = [callTime, acw, breakTime, incomingCallCount];
    redisClient.mget(keys, function (err, reuslt) {
        if (err) {
            console.log(err);
        }
        else {

            productivity.OnCallTime = reuslt[0];
            productivity.AcwTime = reuslt[1];
            productivity.BreakTime = reuslt[2];
            productivity.IncomingCallCount = reuslt[3];

            redisClient.hget(staffedTime, "time", function (err, reuslt) {
                if (err) {
                    console.log(err);
                }
                else {
                    if (err) {
                        console.log(err);
                    }
                    else {

                        try {
                            productivity.StaffedTime = moment.utc(moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(moment(reuslt))).format("HH:mm:ss");
                        } catch (ex) {
                            console.log(ex);
                        }
                        redisClient.keys(missCallCount, function (err, ids) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                redisClient.mget(ids, function (err, misscalls) {
                                    productivity.MissCallCount = misscalls.reduce(function (pv, cv) {
                                        return parseInt(pv) + parseInt(cv);
                                    }, 0);
                                    console.log(productivity);
                                    var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, productivity);
                                    logger.info('[Productivity] . [%s] -[%s]', productivity, jsonString);
                                    res.end(jsonString);
                                });
                            }
                        });
                    }

                }
            });
        }
    });

};

module.exports.GetTransferCallCount = function (req, res, companyId, tenantId) {

    var resourceId = req.params["ResourceId"];
    var key = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");
    redisClient.get(key, function (err, reuslt) {
        if (err) {
            logger.error('[TransferCallCount] - [%s]', key, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, reuslt);
            logger.info('[TransferCallCount] . [%s] -[%s]', key, jsonString);
            res.end(jsonString);
        }
    });
};

module.exports.GetIncomingCallCount = function (req, res, companyId, tenantId) {


    var resourceId = req.params["ResourceId"];
    var key = format("TOTALCOUNT:{0}:{1}:CONNECTED:{2}:param2", tenantId, companyId, resourceId);
    redisClient.get(key, function (err, reuslt) {
        if (err) {
            logger.error('[IncomingCallCount] - [%s]', key, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, reuslt);
            logger.info('[IncomingCallCount] . [%s] -[%s]', key, jsonString);
            res.end(jsonString);
        }
    });
};

module.exports.GetMissCallCount = function (req, res, companyId, tenantId) {

    var resourceId = req.params["ResourceId"];
    var key = format("TOTALCOUNT:{0}:{1}:AGENTREJECT:*:{2}", tenantId, companyId, resourceId);

    redisClient.get(key, function (err, reuslt) {
        if (err) {
            logger.error('[MissCallCount] - [%s]', key, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else {
            redisClient.hmget(reuslt[5], function (err, misscalls) {
                if (err) {
                    logger.error('[MissCallCount] - [%s]', key, err);
                    var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                    res.end(jsonString);
                }
                else {
                    var missCallCount = misscalls.reduce(function (pv, cv) {
                        return parseInt(pv) + parseInt(cv);
                    }, 0);
                    var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, missCallCount);
                    logger.info('[MissCallCount] . [%s] -[%s]', key, jsonString);
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
            logger.error('[HoldTime] - [%s]', key, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, reuslt);
            logger.info('[HoldTime] . [%s] -[%s]', key, jsonString);
            res.end(jsonString);
        }
    });
};

module.exports.GetIdleTime = function (req, res, companyId, tenantId) {

    var resourceId = req.params["ResourceId"];
    var key = resourceId;
    redisClient.get(key, function (err, reuslt) {
        if (err) {
            logger.error('[IdleTime] - [%s]', key, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, reuslt);
            logger.info('[IdleTime] . [%s] -[%s]', key, jsonString);
            res.end(jsonString);
        }
    });
};

module.exports.GetStaffedTime = function (req, res, companyId, tenantId) {


    var resourceId = req.params["ResourceId"];
    var key = format("SESSION:{0}:{1}:LOGIN:{2}:{2}:param2", tenantId, companyId, resourceId);
    redisClient.get(key, function (err, reuslt) {
        if (err) {
            logger.error('[StaffedTime] - [%s]', key, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else {
            var sTime = moment.utc(moment(moment(), "DD/MM/YYYY HH:mm:ss").diff(moment(reuslt, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss")
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, sTime);
            logger.info('[StaffedTime] . [%s] -[%s]', key, jsonString);
            res.end(jsonString);
        }
    });
};

module.exports.GetOnCallTime = function (req, res, companyId, tenantId) {


    var resourceId = req.params["ResourceId"];
    var key = format("TOTALTIME:{0}:{1}:CONNECTED:{2}:param2", tenantId, companyId, resourceId);
    redisClient.get(key, function (err, reuslt) {
        if (err) {
            logger.error('[OnCallTime] - [%s]', key, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, reuslt);
            logger.info('[OnCallTime] . [%s] -[%s]', key, jsonString);
            res.end(jsonString);
        }
    });
};

module.exports.GetBreakTime = function (req, res, companyId, tenantId) {

    var resourceId = req.params["ResourceId"];
    var key = format("TOTALTIME:{0}:{1}:BREAK:{2}:param2", tenantId, companyId, resourceId);
    redisClient.get(key, function (err, reuslt) {
        if (err) {
            logger.error('[BreakTime] - [%s]', key, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, reuslt);
            logger.info('[BreakTime] . [%s] -[%s]', key, jsonString);
            res.end(jsonString);
        }
    });
};

module.exports.GetAcwTime = function (req, res, companyId, tenantId) {

    var resourceId = req.params["ResourceId"];
    var key = format("TOTALTIME:{0}:{1}:AFTERWORK:{2}:param2", tenantId, companyId, resourceId);
    redisClient.get(key, function (err, reuslt) {
        if (err) {
            logger.error('[GetAcwTime] - [%s]', key, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, reuslt);
            logger.info('[GetAcwTime] . [%s] -[%s]', key, jsonString);
            res.end(jsonString);
        }
    });
};