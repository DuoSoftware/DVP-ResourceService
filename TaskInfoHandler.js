/**
 * Created by Rajinda on 10/20/2015.
 */


var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var DbConn = require('dvp-dbmodels');
var moment = require('moment');
var Sequelize = require('sequelize');

function GetAllTasks(callback) {
    DbConn.ResTaskInfo.findAll({
        where: [{Status: true}]
    }).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResTaskInfo.GetAllTask] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResTaskInfo.GetAllTask] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResTaskInfo.GetAllTask] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

module.exports.GetAllTasks = GetAllTasks;
//no need to implement any other methods.