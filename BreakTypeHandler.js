/**
 * Created by Heshan.i on 2/6/2017.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var DbConn = require('dvp-dbmodels');
var util = require('util');
var redis = require('ioredis');
var config = require('config');


var redisip = config.ArdsRedis.ip;
var redisport = config.ArdsRedis.port;
var redispass = config.ArdsRedis.password;
var redismode = config.ArdsRedis.mode;
var redisdb = config.ArdsRedis.db;



var redisSetting =  {
    port:redisport,
    host:redisip,
    family: 4,
    password: redispass,
    db: redisdb,
    retryStrategy: function (times) {
        var delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError: function (err) {

        return true;
    }
};

if(redismode == 'sentinel'){

    if(config.ArdsRedis.sentinels && config.ArdsRedis.sentinels.hosts && config.ArdsRedis.sentinels.port && config.ArdsRedis.sentinels.name){
        var sentinelHosts = config.ArdsRedis.sentinels.hosts.split(',');
        if(Array.isArray(sentinelHosts) && sentinelHosts.length > 2){
            var sentinelConnections = [];

            sentinelHosts.forEach(function(item){

                sentinelConnections.push({host: item, port:config.ArdsRedis.sentinels.port})

            })

            redisSetting = {
                sentinels:sentinelConnections,
                name: config.ArdsRedis.sentinels.name,
                password: redispass,
                db: redisdb
            }

        }else{

            console.log("No enough sentinel servers found .........");
        }

    }
}

var redisArdsClient = undefined;

if(redismode != "cluster") {
    redisArdsClient = new redis(redisSetting);
}else{

    var redisHosts = redisip.split(",");
    if(Array.isArray(redisHosts)){


        redisSetting = [];
        redisHosts.forEach(function(item){
            redisSetting.push({
                host: item,
                port: redisport,
                family: 4,
                password: redispass,
                db: redisdb});
        });

        var redisArdsClient = new redis.Cluster([redisSetting]);

    }else{

        redisArdsClient = new redis(redisSetting);
    }


}

//var redisArdsClient = redis.createClient(config.ArdsRedis.port, config.ArdsRedis.ip);
//redisArdsClient.auth(config.ArdsRedis.password, function (err) {
//    console.log("ArdsRedis[ARDS] Auth error  " + err);
//});

redisArdsClient.on("error", function (err) {
    console.log("Redis[ARDS] connection error  " + err);
});

redisArdsClient.on("connect", function (err) {
});

function SetBreakTypeInRedis(obj){
    try{
        var breakTypeKey = util.format('BreakType:%d:%d:%s', obj.TenantId, obj.CompanyId, obj.BreakType);
        var jsonObj = JSON.stringify(obj);
        redisArdsClient.set(breakTypeKey, jsonObj, function (err, result) {
            if(err){
                logger.error('[DVP-ResResource.SetBreakTypeInRedis] - [REDIS] - SET Failed. [%s] ', err);
            }else{
                logger.info('[DVP-ResResource.SetBreakTypeInRedis] - [REDIS] - SET Success. [%s] ', result);
            }
        });
    }catch(ex){
        logger.error('[DVP-ResResource.SetBreakTypeInRedis] - [REDIS] - SET Failed. [%s] ', ex);
    }
}

function DeleteBreakTypeFromRedis(tenant, company, breakType){
    try{
        var breakTypeKey = util.format('BreakType:%d:%d:%s', tenant, company, breakType);
        redisArdsClient.del(breakTypeKey, function (err, result) {
            if(err){
                logger.error('[DVP-ResResource.RemoveBreakTypeInRedis] - [REDIS] - DEL Failed. [%s] ', err);
            }else{
                logger.info('[DVP-ResResource.RemoveBreakTypeInRedis] - [REDIS] - DEL Success. [%s] ', result);
            }
        });
    }catch(ex){
        logger.error('[DVP-ResResource.RemoveBreakTypeInRedis] - [REDIS] - DEL Failed. [%s] ', ex);
    }
}

function CreateBreakType(tenantId, companyId, breakType, maxDuration, callback) {
    var jsonString;

    maxDuration = maxDuration? maxDuration: 0;
    var tmpBreakType = {
        TenantId: tenantId,
        CompanyId: companyId,
        BreakType: breakType.trim().replace(/ /g,''),
        Active: true,
        MaxDurationPerDay: maxDuration
    };

    DbConn.ResResourceBreakTypes
        .create(tmpBreakType
    ).then(function (bType) {
            SetBreakTypeInRedis(tmpBreakType);

            jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, bType);
            logger.info('[DVP-ResResource.CreateBreakType] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResource.CreateBreakType] - [%s] - [PGSQL] - insertion  failed-[%s]', breakType, err);
            jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });

}

function EditBreakTypeStatus(tenantId, companyId, breakType, isActive, maxDuration, callback) {
    var jsonString;

    DbConn.ResResourceBreakTypes
        .update(
        {
            Active: isActive,
            MaxDurationPerDay: maxDuration
        }, {
            where: [
                {
                    TenantId: tenantId
                },
                {
                    CompanyId: companyId
                },
                {
                    BreakType: breakType
                }
            ]
        }
    ).then(function (bType) {
            var tmpBreakType = {
                TenantId: tenantId,
                CompanyId: companyId,
                BreakType: breakType.trim().replace(/ /g,''),
                Active: isActive,
                MaxDurationPerDay: maxDuration
            };
            SetBreakTypeInRedis(tmpBreakType);

            jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", bType==1, bType);
            logger.info('[DVP-ResResource.EditBreakTypeStatus] - [PGSQL] - update successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResource.EditBreakTypeStatus] - [%s] - [PGSQL] - update  failed-[%s]', breakType, err);
            jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function DeleteBreakType(tenantId, companyId, breakType, callback) {
    var jsonString;

    DbConn.ResResourceBreakTypes
        .destroy(
        {
            where: [
                {
                    TenantId: tenantId
                },
                {
                    CompanyId: companyId
                },
                {
                    BreakType: breakType
                }
            ]
        }
    ).then(function (bType) {
            DeleteBreakTypeFromRedis(tenantId, companyId, breakType);

            jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", bType==1, bType);
            logger.info('[DVP-ResResource.DeleteBreakType] - [PGSQL] - delete successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResource.DeleteBreakType] - [%s] - [PGSQL] - delete  failed-[%s]', breakType, err);
            jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function GetAllBreakTypes(tenantId, companyId, callback) {
    var jsonString;

    DbConn.ResResourceBreakTypes.findAll({
        where: [
            {
                TenantId: tenantId
            },
            {
                CompanyId: companyId
            }
        ]
    }).then(function (breakObjects) {
        if (breakObjects) {
            logger.info('[DVP-ResResource.GetAllBreakTypes] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(breakObjects));
            jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, breakObjects);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResResource.GetAllBreakTypes] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResResource.GetAllBreakTypes] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function GetAllActiveBreakTypes(tenantId, companyId, callback) {
    var jsonString;

    DbConn.ResResourceBreakTypes.findAll({
        where: [
            {
                TenantId: tenantId
            },
            {
                CompanyId: companyId
            },
            {
                Active: true
            }
        ]
    }).then(function (breakObjects) {
        if (breakObjects) {
            logger.info('[DVP-ResResource.GetAllActiveBreakTypes] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(breakObjects));
            jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, breakObjects);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResResource.GetAllActiveBreakTypes] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResResource.GetAllActiveBreakTypes] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}



module.exports.CreateBreakType = CreateBreakType;
module.exports.EditBreakTypeStatus = EditBreakTypeStatus;
module.exports.DeleteBreakType = DeleteBreakType;
module.exports.GetAllBreakTypes = GetAllBreakTypes;
module.exports.GetAllActiveBreakTypes = GetAllActiveBreakTypes;
