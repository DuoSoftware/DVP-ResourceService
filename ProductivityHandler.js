/**
 * Created by Administrator on 3/21/2016.
 */


var config = require('config');
var redis = require('redis');
var redisip = config.Redis.ip;
var redisport = config.Redis.port;
var redisClient = redis.createClient(redisport, redisip);
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var format = require('string-format')

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

module.exports.Productivity = function (req, res, companyId, tenantId) {

    var productivity = {
        AcwTime: 0,
        BreakTime: 0,
        OnCallTime: 0,
        StaffedTime: 0,
        IdleTime: 0,
        HoldTime: 0,
        IncomingCallCount: 0,
        TransferCallCount: 0
    };
    var resourceId = req.params["ResourceId"];
    var key = resourceId;
    var keys = [];
    keys.push(key);
    client.hmget(keys, function (err, reuslt) {
        if (err) {
            logger.error('[TransferCallCount] - [%s]', key, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else {
            productivity.AcwTime = reuslt[0];
            productivity.BreakTime = reuslt[1];
            productivity.OnCallTime = reuslt[2];
            productivity.StaffedTime = reuslt[3];
            productivity.IdleTime = reuslt[4];
            productivity.HoldTime = reuslt[5];
            productivity.IncomingCallCount = reuslt[6];
            productivity.TransferCallCount = reuslt[7];
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, productivity);
            logger.info('[TransferCallCount] . [%s] -[%s]', key, jsonString);
            res.end(jsonString);
        }
    });

};

module.exports.GetTransferCallCount = function (req, res, companyId, tenantId) {

    var resourceId = req.params["ResourceId"];
    var key = "TOTALCOUNT:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "window", resourceId, "parameter2");
    client.get(key, function (err, reuslt) {
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

module.exports.GetIncomingCallCount = function (req, res, companyId, tenantId) { // ,  ,  ,  , , TransferCallCount

    var resourceId = req.params["ResourceId"];
    var key = resourceId;
    client.get(key, function (err, reuslt) {
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

module.exports.GetHoldTime = function (req, res, companyId, tenantId) {

    var resourceId = req.params["ResourceId"];
    var key = resourceId;
    client.get(key, function (err, reuslt) {
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
    client.get(key, function (err, reuslt) {
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
    var key = "TOTALTIME:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "LOGIN", resourceId, "parameter2");
    client.get(key, function (err, reuslt) {
        if (err) {
            logger.error('[StaffedTime] - [%s]', key, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, reuslt);
            logger.info('[StaffedTime] . [%s] -[%s]', key, jsonString);
            res.end(jsonString);
        }
    });
};

module.exports.GetOnCallTime = function (req, res, companyId, tenantId) {

    var resourceId = req.params["ResourceId"];
    var key = resourceId;
    client.get(key, function (err, reuslt) {
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
    var key = "TOTALTIME:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "BREAK", resourceId, "parameter2");
    client.get(key, function (err, reuslt) {
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
    var key = "TOTALTIME:{0}:{1}:{2}:{3}:{4}".format(tenantId, companyId, "AFTERWORK", resourceId, "parameter2");
    client.get(key, function (err, reuslt) {
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