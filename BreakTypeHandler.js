/**
 * Created by Heshan.i on 2/6/2017.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var DbConn = require('dvp-dbmodels');
var util = require('util');
var redis = require('redis');
var config = require('config');

var redisArdsClient = redis.createClient(config.ArdsRedis.port, config.ArdsRedis.ip);
redisArdsClient.auth(config.ArdsRedis.password, function (err) {
    console.log("Redis[ARDS] Auth error  " + err);
});

redisArdsClient.on("error", function (err) {
    console.log("Redis[ARDS] connection error  " + err);
});

redisArdsClient.on("connect", function (err) {
    redisardsClient.select(config.ArdsRedis.ardsData, redis.print);
});

function SetBreakTypeInRedis(obj){
    try{
        var breakTypeKey = util.format('BreakType:%d:%d:%s', obj.TenantId, obj.CompanyId, obj.BreakType);
        var jsonObj = JSON.stringify(obj);
        redisardsClient.set(breakTypeKey, jsonObj, function (err, result) {
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
        redisardsClient.del(breakTypeKey, function (err, result) {
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