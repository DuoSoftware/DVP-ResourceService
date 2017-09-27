/**
 * Created by Pawan on 9/25/2017.
 */
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var attributeHandler = require('./AttributeHandler');
var redisHandler = require('./RedisHandler');
var DbConn = require('dvp-dbmodels');
var uuid = require('node-uuid');




var addNewQueueSetting = function (req, res) {

    var reqId='';
    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    logger.debug('[DVP-ResourceService.addNewQueueSetting] - [%s] - [HTTP] - Request received',reqId);

    if(!req.user.company || !req.user.tenant)
    {
        var jsonString = messageFormatter.FormatMessage(new Error("Invalid Authorization details found "), "ERROR/EXCEPTION", false, undefined);
        logger.error('[DVP-ResourceService.addNewQueueSetting] - [%s] - Unauthorized access  ', reqId);
        res.end(jsonString);
    }


    try {
        if (req.body.QueueName && req.body.MaxWaitTime && req.body.Skills && req.body.CallAbandonedThreshold) {

            recordIdGenenrator(req, reqId, function (errRecId, resRecId) {

                if (errRecId) {
                    var jsonString = messageFormatter.FormatMessage(errRecId, "ERROR/EXCEPTION", false, undefined);
                    logger.debug('[DVP-ResourceService.addNewQueueSetting] - [%s] - Error in record id generation : %s ', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    DbConn.ResQueueSettings
                        .create(
                            {
                                TenantId: req.user.tenant,
                                CompanyId: req.user.company,
                                Skills: req.body.Skills,
                                RecordID: resRecId,
                                QueueName: req.body.QueueName,
                                MaxWaitTime: req.body.MaxWaitTime,
                                CallAbandonedThreshold:req.body.CallAbandonedThreshold,
                                PublishPosition:req.body.PublishPosition
                            }
                        ).then(function (resQueue) {

                        redisHandler.AddNewQueueSettingRecord(resRecId,resQueue,function (errRedis,resRedis) {

                            if(errRedis)
                            {
                                var jsonString = messageFormatter.FormatMessage(errRedis, "Error", true, undefined);
                                logger.error('[DVP-ResourceService.addNewQueueSetting] - [%s] - [PGSQL] - Queue Setting adding failed.  ', reqId);
                                res.end(jsonString);
                            }
                            else
                            {
                                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resQueue);
                                logger.info('[DVP-ResourceService.addNewQueueSetting] - [%s] - [PGSQL] - Queue Setting added successfully.  ', reqId);
                                res.end(jsonString);
                            }
                        });




                    }).error(function (err) {
                        logger.error('[DVP-ResourceService.addNewQueueSetting] - [%s] - [PGSQL] - Queue Setting adding failed.', reqId);
                        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                        res.end(jsonString);
                    });
                }
            });


        }
    } catch (e) {
        logger.error('[DVP-ResourceService.addNewQueueSetting] - [%s] - [PGSQL] - Exception in operation.', reqId);
        var jsonString = messageFormatter.FormatMessage(e, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }


};


var updateQueueSettingProperties = function (req,res) {

    var reqId='';
    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    logger.debug('[DVP-ResourceService.updateQueueSettingProperties] - [%s] - [HTTP] - Request received',reqId);

    if(!req.user.company || !req.user.tenant)
    {
        var jsonString = messageFormatter.FormatMessage(new Error("Invalid Authorization details found "), "ERROR/EXCEPTION", false, undefined);
        logger.error('[DVP-ResourceService.updateQueueSettingProperties] - [%s] - Unauthorized access  ', reqId);
        res.end(jsonString);
    }

    if(req.body.CompanyId)
    {
        delete req.body.CompanyId
    }
    if(req.body.TenantId)
    {
        delete req.body.TenantId
    }
    if(req.body.RecordID)
    {
        delete req.body.RecordID;
    }




    if(req.body.Skills)
    {
        recordIdGenenrator(req,reqId,function (errRecId,resRecId) {
            if(errRecId)
            {
                var jsonString = messageFormatter.FormatMessage(errRecId, "ERROR/EXCEPTION", false, undefined);
                logger.error('[DVP-ResourceService.updateQueueSettingProperties] - [%s] - Record id Generating failed  ', reqId);
                res.end(jsonString);

            }
            else
            {
                req.body.RecordID=resRecId;

                updateQueueRecord(req.params.qID,req.user.company,req.user.tenant,req.body,res);
            }
        });
    }
    else
    {

        updateQueueRecord(req.params.qID,req.user.company,req.user.tenant,req.body,res);

    }








}

var getQueueSetting = function (req,res) {

    var reqId='';
    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    logger.debug('[DVP-ResourceService.getQueueSetting] - [%s] - [HTTP] - Request received',reqId);

    if(!req.user.company || !req.user.tenant)
    {
        var jsonString = messageFormatter.FormatMessage(new Error("Invalid Authorization details found "), "ERROR/EXCEPTION", false, undefined);
        logger.error('[DVP-ResourceService.getQueueSetting] - [%s] - Unauthorized access  ', reqId);
        res.end(jsonString);
    }


    try {
        if (req.params.qID) {
            searchQueueSettingRecord(req.params.qID, req.user.company, req.user.tenant, function (errQ, resQ) {

                if (errQ) {
                    logger.error('[DVP-ResourceService.getQueueSetting] - [%s] - [PGSQL] - Error in searching Queue Setting.', reqId);
                    var jsonString = messageFormatter.FormatMessage(errQ, "EXCEPTION", false, undefined);
                    res.end(jsonString);
                }
                else {
                    logger.error('[DVP-ResourceService.getQueueSetting] - [%s] - [PGSQL] - Queue Setting record found', reqId);
                    var jsonString = messageFormatter.FormatMessage(undefined, "Success", true, resQ);
                    res.end(jsonString);
                }
            });
        }
        else {
            logger.error('[DVP-ResourceService.getQueueSetting] - [%s] - [PGSQL] - No record Id found', reqId);
            var jsonString = messageFormatter.FormatMessage(new Error("No record Id found"), "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
    } catch (e) {
        logger.error('[DVP-ResourceService.getQueueSetting] - [%s] - [PGSQL] - Exception in operation', reqId);
        var jsonString = messageFormatter.FormatMessage(e, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }

}

var searchQueueSettingRecord = function (RecordID,company,tenant,callback) {

    if(RecordID)
    {
        DbConn.ResQueueSettings.find({where:[{RecordID:RecordID},{CompanyId:company},{TenantId:tenant}]}).then(function (resQueue) {
            if(resQueue)
            {
                callback(undefined,resQueue);
            }
            else
            {
                callback(new Error('Queue Setting record searching failed'),undefined);
            }
        }).catch(function (errQueue) {
            callback(errQueue,undefined);
        });
    }
    else
    {
        callback(new Error("No record Id found"),undefined);
    }



}

var searchQueueSettings = function (req,res) {

    var reqId='';
    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    logger.debug('[DVP-ResourceService.getQueueSetting] - [%s] - [HTTP] - Request received',reqId);

    if(!req.user.company || !req.user.tenant)
    {
        var jsonString = messageFormatter.FormatMessage(new Error("Invalid Authorization details found "), "ERROR/EXCEPTION", false, undefined);
        logger.error('[DVP-ResourceService.searchQueueSettings] - [%s] - Unauthorized access  ', reqId);
        res.end(jsonString);
    }


    try {
        DbConn.ResQueueSettings.findAll({where: [{CompanyId: req.user.company}, {TenantId: req.user.tenant}]}).then(function (resQueue) {
            if (resQueue) {

                var jsonString = messageFormatter.FormatMessage(undefined, "Success", true, resQueue);
                logger.info('[DVP-ResourceService.searchQueueSettings] - [%s] - Queue Setting records found  ', reqId);
                res.end(jsonString);


            }
            else {
                var jsonString = messageFormatter.FormatMessage(new Error("No Queue Setting records found "), "ERROR/EXCEPTION", false, undefined);
                logger.error('[DVP-ResourceService.searchQueueSettings] - [%s] - No Queue Setting records found  ', reqId);
                res.end(jsonString);
            }
        }).catch(function (errQueue) {
            var jsonString = messageFormatter.FormatMessage(errQueue, "ERROR/EXCEPTION", false, undefined);
            logger.error('[DVP-ResourceService.searchQueueSettings] - [%s] - Error in searching Queue Setting records  ', reqId);
            res.end(jsonString);
        });
    } catch (e) {
        var jsonString = messageFormatter.FormatMessage(e, "ERROR/EXCEPTION", false, undefined);
        logger.error('[DVP-ResourceService.searchQueueSettings] - [%s] - Exception in operation  ', reqId);
        res.end(jsonString);
    }




}


var recordIdGenenrator = function (req,reqId,callback) {

    if(!req.user.company || !req.user.tenant)
    {
        var jsonString = messageFormatter.FormatMessage(new Error("Invalid Authorization details found "), "ERROR/EXCEPTION", false, undefined);
        logger.debug('[DVP-ResourceService.recordIdGenenrator] - [%s] -Invalid Authorization details found : %s ', reqId, jsonString);
        callback(new Error('Invalid Authorization details found'),undefined);
    }

    try {
        var recordId = "Queue:";
        recordId = recordId.concat(req.user.company, ":", req.user.tenant);

        if (req.body.serverType && req.body.reqType) {

            recordId = recordId.concat(":",req.body.serverType, ":", req.body.reqType);

        }


        if (req.body.Skills) {


            GetAllAttributeRecords(req.user.tenant,req.user.company,function (errAttrb,resAttrb) {

                if(errAttrb)
                {
                    callback(errAttrb,undefined);
                }
                else
                {
                    if(resAttrb)
                    {
                        var attribArray = resAttrb.map(function (item) {

                            return item.AttributeId
                        });

                        req.body.Skills.forEach(function (item) {

                            if(attribArray.indexOf(parseInt(item))!=-1)
                            {
                                recordId = recordId.concat(":","attribute_",item);
                            }

                        });

                        callback(undefined, recordId);

                    }
                    else
                    {
                        callback(new Error("No attributes found"),undefined);
                    }
                }

            });





        }
        else {
            callback(recordId, undefined);
        }
    } catch (e) {
        callback(e,undefined);
    }




};

var updateQueueRecord = function (recId,company,tenant,obj,res) {

    searchQueueSettingRecord(recId,company,tenant,function (errRec,resRec) {

        if(errRec)
        {
            var jsonString = messageFormatter.FormatMessage(errRec, "ERROR/EXCEPTION", false, undefined);
            logger.error('[DVP-ResourceService.updateQueueRecord] - [%s] - Error in searching Queue Setting record  ', obj.reqId);
            res.end(jsonString);
        }
        else
        {
            resRec.updateAttributes(obj).then(function (resUpdate) {

                var jsonString = messageFormatter.FormatMessage(undefined, "Success", true, resUpdate);
                logger.error('[DVP-ResourceService.updateQueueRecord] - [%s] - Record updated successfully  ', obj.reqId);
                res.end(jsonString);
            }).catch(function (errUpdate) {
                var jsonString = messageFormatter.FormatMessage(errUpdate, "ERROR/EXCEPTION", false, undefined);
                logger.error('[DVP-ResourceService.updateQueueRecord] - [%s] - Error in updating Queue Setting record  ', obj.reqId);
                res.end(jsonString);
            })
        }
    });



}


var removeQueueSetting = function (req,res) {

    var reqId='';
    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    logger.debug('[DVP-ResourceService.addNewQueueSetting] - [%s] - [HTTP] - Request received',reqId);

    if(!req.user.company || !req.user.tenant)
    {
        var jsonString = messageFormatter.FormatMessage(new Error("Invalid Authorization details found "), "ERROR/EXCEPTION", false, undefined);
        logger.error('[DVP-ResourceService.addNewQueueSetting] - [%s] - Unauthorized access  ', reqId);
        res.end(jsonString);
    }

    try {
        if (req.params.qID) {
            DbConn.ResQueueSettings.destroy({where:[{RecordID: req.params.qID}, {CompanyId: req.user.company}, {TenantId: req.user.tenant}]}).then(function (resDel) {

                redisHandler.RemoveQueueSettingRecord(req.params.qID,function (errRem,resRem) {
                    if(errRem)
                    {

                        var jsonString = messageFormatter.FormatMessage(new Error("Error in removing queue setting record"), "ERROR/EXCEPTION", false, undefined);
                        logger.error('[DVP-ResourceService.addNewQueueSetting] - [%s] - Error in removing Queue setting Record  ', reqId);
                        res.end(jsonString);
                    }
                    else
                    {
                        var jsonString = messageFormatter.FormatMessage(undefined, "Success", true, resDel);
                        logger.error('[DVP-ResourceService.addNewQueueSetting] - [%s] -  Queue setting Record removed successfully  ', reqId);
                        res.end(jsonString);
                    }
                });



            }).catch(function (errDel) {

                var jsonString = messageFormatter.FormatMessage(errDel, "ERROR/EXCEPTION", false, undefined);
                logger.error('[DVP-ResourceService.addNewQueueSetting] - [%s] - Error in removing Queue setting Record  ', reqId);
                res.end(jsonString);

            });
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("No QueueSetting record Id found "), "ERROR/EXCEPTION", false, undefined);
            logger.error('[DVP-ResourceService.addNewQueueSetting] - [%s] - No QueueSetting record Id found  ', reqId);
            res.end(jsonString);
        }
    } catch (e) {
        var jsonString = messageFormatter.FormatMessage(e, "EXCEPTION", false, undefined);
        logger.error('[DVP-ResourceService.addNewQueueSetting] - [%s] - Exception in operation  ', reqId);
        res.end(jsonString);
    }


};

var GetAllAttributeRecords =function(tenantId, companyId, callback) {

    DbConn.ResAttribute.findAll({where: [{Status: true}, {TenantId: tenantId}, {CompanyId: companyId}],order: [['AttributeId', 'DESC']]}).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResAttribute.GetAllAttributes] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback(undefined,CamObject);
        }
        else {
            logger.error('[DVP-ResAttribute.GetAllAttributes] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback(new Error('No Records'),undefined);
        }
    }).error(function (err) {
        logger.error('[DVP-ResAttribute.GetAllAttributes] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback(err,undefined);
    });
};



module.exports.addNewQueueSetting=addNewQueueSetting;
module.exports.getQueueSetting=getQueueSetting;
module.exports.searchQueueSettings=searchQueueSettings;
module.exports.updateQueueSettingProperties=updateQueueSettingProperties;
module.exports.removeQueueSetting=removeQueueSetting;