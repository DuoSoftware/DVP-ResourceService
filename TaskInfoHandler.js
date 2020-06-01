/**
 * Created by Rajinda on 10/20/2015.
 */


var messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common-lite/LogHandler/CommonLogHandler.js').logger;
var DbConn = require('dvp-dbmodels');
var moment = require('moment');
var Sequelize = require('sequelize');

function GetAllTasks(callback) {
    var jsonString;
    DbConn.ResTaskInfo.findAll({
        where: [{Status: true}]
    }).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResTaskInfo.GetAllTask] - [PGSQL]  - Data found  -[%s]', JSON.stringify(CamObject));
            jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResTaskInfo.GetAllTask] - [PGSQL]  - No record found');
            jsonString = messageFormatter.FormatMessage(undefined, "No record", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResTaskInfo.GetAllTask] - [PGSQL]  - Error in searching.-[%s]', err);
        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

module.exports.GetAllTasks = GetAllTasks;
//no need to implement any other methods.