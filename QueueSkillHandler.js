/**
 * Created by Pawan on 9/25/2017.
 */
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var attributeHandler = require('./AttributeHandler');
var redisHandler = require('./RedisHandler');
var DbConn = require('dvp-dbmodels');
var uuid = require('node-uuid');
var underscore = require('underscore');



// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}



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
        if (req.body.QueueName && req.body.MaxWaitTime && req.body.Skills && req.body.CallAbandonedThreshold && req.body.ServerType && req.body.RequestType) {

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
                                PublishPosition:req.body.PublishPosition,
                                ServerType:req.body.ServerType,
                                RequestType:req.body.RequestType
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
    if(req.body.RequestType)
    {
        delete req.body.RequestType;
    }
    if(req.body.ServerType)
    {
        delete req.body.ServerType;
    }


    updateQueueRecord(req.params.qID,req.user.company,req.user.tenant,req.body,res);


    /* if(req.body.Skills)
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
     */







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

            redisHandler.SearchQueueSettingRecord(req.params.qID,function (errRec,resRec) {

                if(errRec)
                {
                    logger.error('[DVP-ResourceService.getQueueSetting] - [%s] - [PGSQL] - Error in searching Queue Setting.', reqId);
                    var jsonString = messageFormatter.FormatMessage(errRec, "EXCEPTION", false, undefined);
                    res.end(jsonString);
                }
                else
                {
                    if(resRec)
                    {
                        logger.info('[DVP-ResourceService.getQueueSetting] - [%s] - [PGSQL] - Queue Setting record found', reqId);
                        var jsonString = messageFormatter.FormatMessage(undefined, "Success", true, JSON.parse(resRec));
                        res.end(jsonString);
                    }
                    else
                    {
                        searchQueueSettingRecord(req.params.qID, req.user.company, req.user.tenant, function (errQ, resQ) {

                            if (errQ) {
                                logger.error('[DVP-ResourceService.getQueueSetting] - [%s] - [PGSQL] - Error in searching Queue Setting.', reqId);
                                var jsonString = messageFormatter.FormatMessage(errQ, "EXCEPTION", false, undefined);
                                res.end(jsonString);
                            }
                            else {
                                /* logger.info('[DVP-ResourceService.getQueueSetting] - [%s] - [PGSQL] - Queue Setting record found', reqId);
                                 var jsonString = messageFormatter.FormatMessage(undefined, "Success", true, resQ);
                                 res.end(jsonString);*/
                                if(resQ)
                                {

                                    logger.info('[DVP-ResourceService.getQueueSetting] - [%s] - [PGSQL] - Queue Setting record found in Postgres , Adding missing record to Redis', reqId);
                                    var jsonString = messageFormatter.FormatMessage(undefined, "Success", true, resQ);
                                    res.end(jsonString);

                                    redisHandler.AddNewQueueSettingRecord(req.params.qID,resQ,function (errAdd,resAdd) {

                                        if(errAdd)
                                        {
                                            logger.error('[DVP-ResourceService.getQueueSetting] - [%s] - [PGSQL] - Error in saving Queue Setting record to Redis.', reqId);

                                        }
                                        else
                                        {
                                            if(resAdd)
                                            {
                                                logger.info('[DVP-ResourceService.getQueueSetting] - [%s] - [PGSQL] - Queue Setting record added to redis successfully', reqId);

                                            }
                                            else
                                            {
                                                logger.info('[DVP-ResourceService.getQueueSetting] - [%s] - [PGSQL] - Failed to Add Queue setting record to redis', reqId);

                                            }
                                        }
                                    });
                                }else{
                                    logger.info('[DVP-ResourceService.getQueueSetting] - [PGSQL] - Queue Setting record not found in Postgres');
                                    var jsonString = messageFormatter.FormatMessage(undefined, "Failed", false, undefined);
                                    res.end(jsonString);
                                }


                            }
                        });
                    }
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

            callback(undefined,resQueue);


        }).catch(function (errQueue) {
            callback(errQueue,undefined);
        });
    }
    else
    {
        callback(new Error("No record Id found"),undefined);
    }



}

var searchQueueSettings = function (req,callback) {



    if(!req.user.company || !req.user.tenant)
    {
        callback(new Error("Invalid Authorization details found "),undefined);

    }


    try {
        DbConn.ResQueueSettings.findAll({where: [{CompanyId: req.user.company}, {TenantId: req.user.tenant}]}).then(function (resQueue) {

            callback(undefined,resQueue);


        }).catch(function (errQueue) {
            callback(errQueue,undefined);
        });
    } catch (e) {
        callback(e,undefined);
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

        if (req.body.ServerType && req.body.RequestType) {

            recordId = recordId.concat(":",req.body.ServerType, ":", req.body.RequestType);

        }


        if (req.body.Skills) {


            var skilArr= req.body.Skills.sort();

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

                        skilArr.forEach(function (item) {

                            if(attribArray.indexOf(parseInt(item))!=-1)
                            {
                                recordId = recordId.concat(":","attribute_",item);
                            }

                        });

                        callback(undefined, recordId);

                    }
                    else
                    {
                        callback(undefined,undefined);
                    }
                }

            });





        }
        else {
            callback(new Error("No skills found"), undefined);
        }
    } catch (e) {
        callback(e,undefined);
    }




};

var updateQueueRecord = function (recId,company,tenant,obj,res) {

    try {
        searchQueueSettingRecord(recId, company, tenant, function (errRec, resRec) {

            if (errRec) {
                var jsonString = messageFormatter.FormatMessage(errRec, "ERROR/EXCEPTION", false, undefined);
                logger.error('[DVP-ResourceService.updateQueueRecord] - [%s] - Error in searching Queue Setting record  ', obj.reqId);
                res.end(jsonString);
            }
            else {
                resRec.updateAttributes(obj).then(function (resUpdate) {

                    if (resUpdate) {
                        redisHandler.AddNewQueueSettingRecord(resUpdate.RecordID, resUpdate, function (errRedis, resRedis) {
                            if (errRedis) {
                                var jsonString = messageFormatter.FormatMessage(errRedis, "ERROR", false, undefined);
                                logger.info('[DVP-ResourceService.updateQueueRecord] - [%s] - Record updated successfully but not updated redis   ', obj.reqId);
                                res.end(jsonString);
                            }
                            else {

                                var jsonString = messageFormatter.FormatMessage(undefined, "Success", true, resUpdate);
                                logger.info('[DVP-ResourceService.updateQueueRecord] - [%s] - Record updated successfully  ', obj.reqId);
                                res.end(jsonString);


                            }
                        });
                    }
                    else {
                        var jsonString = messageFormatter.FormatMessage(new Error("Record updation failed"), "ERROR", false, undefined);
                        logger.info('[DVP-ResourceService.updateQueueRecord] - [%s] - Record updation failed   ', obj.reqId);
                        res.end(jsonString);
                    }


                }).catch(function (errUpdate) {
                    var jsonString = messageFormatter.FormatMessage(errUpdate, "ERROR/EXCEPTION", false, undefined);
                    logger.error('[DVP-ResourceService.updateQueueRecord] - [%s] - Error in updating Queue Setting record  ', obj.reqId);
                    res.end(jsonString);
                })
            }
        });
    } catch (e) {
        var jsonString = messageFormatter.FormatMessage(e, "ERROR/EXCEPTION", false, undefined);
        logger.error('[DVP-ResourceService.updateQueueRecord] - [%s] - Exception in operation  ', obj.reqId);
        res.end(jsonString);
    }



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


        callback(undefined,CamObject);

    }).error(function (err) {

        callback(err,undefined);
    });
};

var GetMyQueues = function (req,res) {

    var reqId='';
    var myQueues=[];
    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    if(JSON.parse(req.query.Skills))
    {
        searchQueueSettings(req,function (errQueues,resQueues) {

            if(errQueues)
            {
                var jsonString = messageFormatter.FormatMessage(new Error("Error in searching all queue setting records"), "ERROR/EXCEPTION", false, undefined);
                logger.error('[DVP-ResourceService.GetMyQueues] - [%s] - Error in searching all queue setting Record  ', reqId);
                res.end(jsonString);
            }
            else
            {
                if(resQueues)
                {


                    myQueues = resQueues.filter(function (item) {

                        // return (item.Skills).equals();
                        return (item.Skills.length === underscore.intersection(item.Skills, JSON.parse(req.query.Skills)).length)
                    });

                    var jsonString = messageFormatter.FormatMessage(undefined, "Success", true, myQueues);
                    logger.info('[DVP-ResourceService.GetMyQueues] - [%s] - Queue setting records found  ', reqId);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(undefined, "ERROR/EXCEPTION", false, undefined);
                    logger.error('[DVP-ResourceService.GetMyQueues] - [%s] - No queue setting records found  ', reqId);
                    res.end(jsonString);
                }
            }
        });
    }
    else
    {
        var jsonString = messageFormatter.FormatMessage(new Error("No skills received to compare"), "ERROR/EXCEPTION", false, undefined);
        logger.error('[DVP-ResourceService.GetMyQueues] - [%s] - No skills received to compare  ', reqId);
        res.end(jsonString);
    }


};

/*var checkMyQueue = function (req,res) {

 var reqId='';
 try
 {
 reqId = uuid.v1();
 }
 catch(ex)
 {

 }
 if(!req.user.company || !req.user.tenant)
 {
 var jsonString = messageFormatter.FormatMessage(new Error("Invalid Authorization details found "), "ERROR/EXCEPTION", false, false);
 logger.error('[DVP-ResourceService.checkMyQueue] - [%s] - Unauthorized access  ', reqId);
 res.end(jsonString);

 }



 if(req.params.qID && req.query.Skills)
 {
 searchQueueSettingRecord(req.params.qID,req.user.company,req.user.tenant,function (errSearch,resSearch) {

 if(errSearch)
 {
 var jsonString = messageFormatter.FormatMessage(new Error("Error in searching  queue setting record"), "ERROR/EXCEPTION", false, false);
 logger.error('[DVP-ResourceService.checkMyQueue] - [%s] - Error in searching queue setting Record  ', reqId);
 res.end(jsonString);
 }
 else
 {
 if(resSearch)
 {
 var isMyQueue=resSearch.Skills.length === underscore.intersection(resSearch.Skills, JSON.parse(req.query.Skills)).length;

 if(isMyQueue)
 {
 var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, true);
 logger.error('[DVP-ResourceService.checkMyQueue] - [%s] - Queue is identified as My Queue ', reqId);
 res.end(jsonString);
 }
 else
 {
 var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, false);
 logger.error('[DVP-ResourceService.checkMyQueue] - [%s] - Queue is not identified as My Queue ', reqId);
 res.end(jsonString);
 }

 }
 else
 {
 var jsonString = messageFormatter.FormatMessage(undefined, "ERROR/EXCEPTION", false, false);
 logger.error('[DVP-ResourceService.checkMyQueue] - [%s] - No queue setting record found  ', reqId);
 res.end(jsonString);
 }
 }
 });
 }
 else
 {
 var jsonString = messageFormatter.FormatMessage(new Error("Record Id or Skill set missing"), "ERROR/EXCEPTION", false, false);
 logger.error('[DVP-ResourceService.checkMyQueue] - [%s] - Record Id or Skill set missing  ', reqId);
 res.end(jsonString);
 }


 }*/

var checkMyQueue = function (req,res) {

    var reqId='';
    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }
    if(!req.user.company || !req.user.tenant)
    {
        var jsonString = messageFormatter.FormatMessage(new Error("Invalid Authorization details found "), "ERROR/EXCEPTION", false, false);
        logger.error('[DVP-ResourceService.checkMySkills] - [%s] - Unauthorized access  ', reqId);
        res.end(jsonString);

    }



    if(req.params.resId  && req.params.qID)
    {


        DbConn.ResResource
            .find({
                where: [{ResourceId:req.params.resId},{TenantId:req.user.tenant},{CompanyId:req.user.company},{Status: true}],
                include:[{model: DbConn.ResResourceTask,  as: "ResResourceTask" , include:[{model:DbConn.ResResourceAttributeTask , as: "ResResourceAttributeTask" }]}]

            }).then(function (resAttrib) {
            if(resAttrib)
            {

                if(resAttrib.ResResourceTask.length>0)
                {
                    var skillArr=[];
                    resAttrib.ResResourceTask.forEach(function (item) {

                        if(item.ResResourceAttributeTask.length>0)
                        {
                            item.ResResourceAttributeTask.forEach(function (skill) {

                                skillArr.push(skill.AttributeId.toString());
                            });
                        }
                    });
                }

                if(skillArr.length>0)
                {
                    searchQueueSettingRecord(req.params.qID,req.user.company,req.user.tenant,function (errSearch,resSearch) {

                        if(errSearch)
                        {
                            var jsonString = messageFormatter.FormatMessage(new Error("Error in searching  queue setting record"), "ERROR/EXCEPTION", false, false);
                            logger.error('[DVP-ResourceService.checkMyQueue] - [%s] - Error in searching queue setting Record  ', reqId);
                            res.end(jsonString);
                        }
                        else
                        {
                            if(resSearch)
                            {
                                var isMyQueue=resSearch.Skills.length === underscore.intersection(resSearch.Skills, skillArr).length;

                                if(isMyQueue)
                                {
                                    var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, true);
                                    logger.info('[DVP-ResourceService.checkMyQueue] - [%s] - Queue is identified as My Queue ', reqId);
                                    res.end(jsonString);
                                }
                                else
                                {
                                    var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, false);
                                    logger.error('[DVP-ResourceService.checkMyQueue] - [%s] - Queue is not identified as My Queue ', reqId);
                                    res.end(jsonString);
                                }

                            }
                            else
                            {
                                var jsonString = messageFormatter.FormatMessage(undefined, "ERROR/EXCEPTION", false, false);
                                logger.error('[DVP-ResourceService.checkMyQueue] - [%s] - No queue setting record found  ', reqId);
                                res.end(jsonString);
                            }
                        }
                    });


                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", false, undefined);
                    logger.error('[DVP-ResourceService.checkMyQueue] - [%s] - No Skills found  ', reqId);
                    res.end(jsonString);
                }

            }
            else
            {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", false, false);
                logger.error('[DVP-ResourceService.checkMyQueue] - [%s] - No resource attributes found  ', reqId);
                res.end(jsonString);
            }

        },function (errAttrib) {
            var jsonString = messageFormatter.FormatMessage(errAttrib, "ERROR", false, false);
            logger.error('[DVP-ResourceService.checkMyQueue] - [%s] - Error in searching data  ', reqId);
            res.end(jsonString);
        });



    }
    else
    {
        var jsonString = messageFormatter.FormatMessage(new Error("Record Id or Skill set missing"), "ERROR/EXCEPTION", false, false);
        logger.error('[DVP-ResourceService.checkMyQueue] - [%s] - Record Id or Skill set missing  ', reqId);
        res.end(jsonString);
    }


}

var loadQueueAttributes = function (req,res) {

    var reqId='';
    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }
    if(!req.user.company || !req.user.tenant)
    {
        var jsonString = messageFormatter.FormatMessage(new Error("Invalid Authorization details found "), "ERROR/EXCEPTION", false, false);
        logger.error('[DVP-ResourceService.loadQueueAttributes] - [%s] - Unauthorized access  ', reqId);
        res.end(jsonString);

    }

    try {
        if (req.params.qID) {
            searchQueueSettingRecord(req.params.qID, req.user.company, req.user.tenant, function (errRecord, resRecord) {

                if (errRecord) {
                    var jsonString = messageFormatter.FormatMessage(new Error("Error in searching  queue setting record"), "ERROR/EXCEPTION", false, undefined);
                    logger.error('[DVP-ResourceService.loadQueueAttributes] - [%s] - Error in searching queue setting Record  ', reqId);
                    res.end(jsonString);
                }
                else {
                    if (resRecord) {
                        var queryObj =
                            {
                                $or: []
                            };

                        resRecord.Skills.forEach(function (item) {

                            queryObj.$or.push({AttributeId: item});
                        });

                        DbConn.ResAttribute.findAll({where:queryObj}).then(function (resSkills) {

                            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resSkills);
                            logger.info('[DVP-ResourceService.loadQueueAttributes] - [%s] - Found :-  Queue Attribute Records ', reqId);
                            res.end(jsonString);
                        }, function (errSkills) {
                            var jsonString = messageFormatter.FormatMessage(errSkills, "ERROR/EXCEPTION", false, undefined);
                            logger.error('[DVP-ResourceService.loadQueueAttributes] - [%s] - Error in searching Queue Attribute Records ', reqId);
                            res.end(jsonString);
                        });
                    }
                    else {
                        var jsonString = messageFormatter.FormatMessage(undefined, "ERROR/EXCEPTION", false, undefined);
                        logger.error('[DVP-ResourceService.loadQueueAttributes] - [%s] - No Queue setting record found ', reqId);
                        res.end(jsonString);
                    }
                }
            });
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Record Id bot found"), "ERROR/EXCEPTION", false, undefined);
            logger.error('[DVP-ResourceService.loadQueueAttributes] - [%s] - Record Id missing  ', reqId);
            res.end(jsonString);
        }
    } catch (e) {
        var jsonString = messageFormatter.FormatMessage(e, "ERROR/EXCEPTION", false, undefined);
        logger.error('[DVP-ResourceService.loadQueueAttributes] - [%s] - Exception in operation  ', reqId);
        res.end(jsonString);
    }



}


module.exports.addNewQueueSetting=addNewQueueSetting;
module.exports.getQueueSetting=getQueueSetting;
module.exports.searchQueueSettings=searchQueueSettings;
module.exports.updateQueueSettingProperties=updateQueueSettingProperties;
module.exports.removeQueueSetting=removeQueueSetting;
module.exports.GetMyQueues=GetMyQueues;
module.exports.checkMyQueue=checkMyQueue;
module.exports.loadQueueAttributes=loadQueueAttributes;
