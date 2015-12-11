/**
 * Created by Rajinda on 10/1/2015.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var DbConn = require('dvp-dbmodels');
var moment = require('moment');
var Sequelize = require('sequelize');


function CreateTask(tenantId, companyId, taskInfoId, otherData, callback) {
    DbConn.ResTask
        .create(
        {
            TenantId: tenantId,
            CompanyId: companyId,
            TaskInfoId: taskInfoId,
            OtherData: otherData,
            Status: true
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResTask.CreateTask] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResTask.CreateTask] - [%s] - [PGSQL] - insertion  failed-[%s]', taskInfoId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function EditTask(taskId, tenantId, companyId, taskInfoId, otherData, callback) {
    DbConn.ResTask
        .update(
        {
            TaskInfoId: taskInfoId,
            OtherData: otherData,
            Status: true
        },
        {
            where:[{TaskId:taskId},{TenantId: tenantId},{CompanyId: companyId}]
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", cmp==1, cmp);
            logger.info('[DVP-ResTask.EditTask] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResTask.EditTask] - [%s] - [PGSQL] - insertion  failed-[%s]', taskInfoId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function DeleteTask(taskId,tenantId, companyId, callback) {
    DbConn.ResTask
        .update(
        {
            Status: false
        },
        {
            where: [{TaskId: taskId}, {TenantId: tenantId}, {CompanyId: companyId}]
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", cmp==1, cmp);
            logger.info('[DVP-ResTask.DeleteTask] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResTask.DeleteTask] - [%s] - [PGSQL] - insertion  failed-[%s]', taskId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function GetAllTasks(tenantId, companyId,  callback) {
    DbConn.ResTask.findAll({
        where: [{CompanyId: companyId}, {TenantId: tenantId}, {Status: true}],
        include: [{ model: DbConn.ResTaskInfo, as: "ResTaskInfo" }]
    }).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResTask.GetAllTask] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResTask.GetAllTask] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResTask.GetAllTask] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function GetTaskById(taskId,tenantId, companyId,  callback) {
    DbConn.ResTask.findAll({
        where: [{TaskId:taskId},{CompanyId: companyId}, {TenantId: tenantId}, {Status: true}]
    }).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResTask.GetTaskById] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResTask.GetTaskById] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResTask.GetTaskById] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

module.exports.CreateTask = CreateTask;
module.exports.EditTask = EditTask;
module.exports.DeleteTask = DeleteTask;
module.exports.GetAllTasks = GetAllTasks;
module.exports.GetTaskById = GetTaskById;