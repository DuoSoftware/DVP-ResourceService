/**
 * Created by Rajinda on 9/29/2015.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var DbConn = require('dvp-dbmodels');
var moment = require('moment');
var Sequelize = require('sequelize');


function CreateResource(resClass, resType, resCategory, tenantId, companyId, resourceName, otherData, callback) {
    DbConn.ResResource
        .create(
        {
            ResClass: resClass,
            ResType: resType,
            ResCategory: resCategory,
            TenantId: tenantId,
            CompanyId: companyId,
            ResourceName: resourceName,
            OtherData: otherData,
            Status: true
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResource.CreateResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResource.CreateResource] - [%s] - [PGSQL] - insertion  failed-[%s]', resourceName, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function EditResource(resourceId, resClass, resType, resCategory, tenantId, companyId, resourceName, otherData, callback) {
    DbConn.ResResource
        .update(
        {
            ResClass: resClass,
            ResType: resType,
            ResCategory: resCategory,
            TenantId: tenantId,
            CompanyId: companyId,
            ResourceName: resourceName,
            OtherData: otherData,
            Status: true
        }, {
            where: {
                ResourceId: resourceId
            }
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", cmp==1, cmp);
            logger.info('[DVP-ResResource.EditResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResource.EditResource] - [%s] - [PGSQL] - insertion  failed-[%s]', resourceId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function DeleteResource(resourceId,  callback) {
    DbConn.ResResource
        .update(
        {
            Status: false
        }, {
            where: {
                ResourceId: resourceId
            }
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", cmp==1, cmp);
            logger.info('[DVP-ResResource.DeleteResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResource.DeleteResource] - [%s] - [PGSQL] - insertion  failed-[%s]', resourceId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function GetAllResource(tenantId, companyId, callback) {
    DbConn.ResResource.findAll({
        where: [{CompanyId: companyId}, {TenantId: tenantId}, {Status: true}]
    }).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResResource.GetAllResource] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResResource.GetAllResource] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResResource.GetAllResource] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function GetAllResourceById(resourceId,tenantId, companyId, callback) {

    DbConn.ResResource.find({
        where: [{CompanyId: companyId}, {TenantId: tenantId}, {Status: true},{ResourceId: resourceId}]
    }).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResResource.GetAllResourceById] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResResource.GetAllResourceById] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResResource.GetAllResourceById] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function AssignTaskToResource(resourceId,taskId,tenantId,companyId,concurrency,refInfo,otherData,callback){

    DbConn.ResResourceTask
        .create(
        {
            ResourceId:resourceId,TaskId:taskId,TenantId:tenantId,CompanyId:companyId,Concurrency:concurrency,RefInfo:refInfo,OtherData:otherData,
            Status: true
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceTask.AssignTaskToResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceTask.AssignTaskToResource] - [%s] - [PGSQL] - insertion  failed-[%s]', resourceId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function UpdateAssignTaskToResource(resourceId,taskId,tenantId,companyId,concurrency,refInfo,otherData,callback){

    DbConn.ResResourceTask
        .update(
        {
            Concurrency:concurrency,RefInfo:refInfo,OtherData:otherData,Status: true
        }
        ,
        {
            where:[{ResourceId:resourceId},{TaskId:taskId},{TenantId: tenantId},{CompanyId: companyId}]
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceTask.AssignTaskToResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceTask.AssignTaskToResource] - [%s] - [PGSQL] - insertion  failed-[%s]', resourceId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function GetTaskByResourceId(resourceId,tenantId,companyId,callback){
    DbConn.ResResourceTask.findAll(
        {
            where :[{ResourceId:resourceId},{TenantId:tenantId},{CompanyId:companyId},{Status: true}],
            include: [{ model: DbConn.ResResource,  as: "ResResource" },{ model: DbConn.ResTask, as: "ResTask" ,include: [{ model: DbConn.ResTaskInfo, as: "ResTaskInfo" }]}]



        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceTask.GetTaskByResourceId] - [PGSQL] -  successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceTask.GetTaskByResourceId] - [%s] - [PGSQL] -  failed-[%s]', resourceId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function GetResourceByTaskId(taskId,tenantId,companyId,callback){
    DbConn.ResResourceTask.findAll(
        {
            where :[{TaskId:taskId},{TenantId:tenantId},{CompanyId:companyId},{Status: true}],
            include: [{ model: DbConn.ResResource,  as: "ResResource" },
                { model: DbConn.ResTask, as: "ResTask"   }
            ]
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceTask.GetResourceByTaskId] - [PGSQL] -  successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceTask.GetResourceByTaskId] - [%s] - [PGSQL] -  failed-[%s]', taskId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function RemoveTaskFromResource(resourceId,taskId,tenantId,companyId,callback){
    DbConn.ResResourceTask.destroy(
        {
            where :[{ResourceId:resourceId},{TaskId:taskId},{TenantId:tenantId},{CompanyId:companyId}]

        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceTask.RemoveTasFromResource] - [PGSQL] -  successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceTask.RemoveTasFromResource] - [%s] - [PGSQL] -  failed-[%s]', taskId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function RemoveAllTasksAssignToResource(resourceId,tenantId,companyId,callback){
    DbConn.ResResourceTask.destroy(
        {
            where :[{ResourceId:resourceId},{TenantId:tenantId},{CompanyId:companyId}]
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceTask.RemoveTasFromResource] - [PGSQL] -  successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceTask.RemoveTasFromResource] - [%s] - [PGSQL] -  failed-[%s]', taskId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function AddAttributeToResource(params,body,tenantId,companyId,callback){

    DbConn.ResResourceAttributeTask
        .create(
        {
            Percentage: body.Percentage,
            AttributeId: params.AttributeId,
            ResTaskId: params.ResTaskId,
            TenantId:  tenantId,
            CompanyId:  companyId,
            OtherData: body.OtherData,
            Status: true
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceAttributeTask] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceAttributeTask] - [%s] - [PGSQL] - insertion  failed-[%s]', companyId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function EditAttributeToResource(params,body,tenantId,companyId,callback){

    DbConn.ResResourceAttributeTask
        .update(
        {
            Percentage: body.Percentage,
            AttributeId: params.AttributeId,
            ResTaskId: params.ResTaskId,
            TenantId:  tenantId,
            CompanyId:  companyId,
            OtherData: body.OtherData,
            Status: true
        },{
        where: {
            ResAttId: params.ResAttId
        }
    }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-EditAttributeToResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-EditAttributeToResource] - [%s] - [PGSQL] - insertion  failed-[%s]', companyId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function DeleteAttributeToResource(params,body,tenantId,companyId,callback){

    DbConn.ResResourceAttributeTask
        .update(
        {
            Status: false
        },{
            where: {
                ResAttId: params.ResAttId
            }
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-DeleteAttributeToResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-DeleteAttributeToResource] - [%s] - [PGSQL] - insertion  failed-[%s]', companyId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function ViewAttributeToResource(params,tenantId,companyId,callback){

    DbConn.ResResourceAttributeTask
        .findAll({
            where: [{TenantId:tenantId},{CompanyId:companyId},{Status: true}]
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ViewAttributeToResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ViewAttributeToResource] - [%s] - [PGSQL] - insertion  failed-[%s]', companyId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function ViewAttributeToResourceByResAttId(params,body,tenantId,companyId,callback){

    DbConn.ResResourceAttributeTask
        .findAll({
            where: [{ResAttId:params.ResAttId},{TenantId:tenantId},{CompanyId:companyId},{Status: true}],
            include: [{ model: DbConn.ResAttribute,  as: "ResAttribute" }]
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ViewAttributeToResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ViewAttributeToResource] - [%s] - [PGSQL] - insertion  failed-[%s]', companyId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function ViewAttributeToResourceByResTaskId(params,body,tenantId,companyId,callback){

    DbConn.ResResourceTask
        .findAll({
            where: [{ResTaskId:params.ResTaskId},{TenantId:tenantId},{CompanyId:companyId},{Status: true}],
            include: [{ model: DbConn.ResResourceAttributeTask,  as: "ResResourceAttributeTask" },{ model: DbConn.ResAttribute, as: "ResAttribute" }]
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ViewAttributeToResourceByResTaskId] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ViewAttributeToResourceByResTaskId] - [%s] - [PGSQL] - insertion  failed-[%s]', companyId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

module.exports.CreateResource = CreateResource;
module.exports.EditResource = EditResource;
module.exports.DeleteResource = DeleteResource;
module.exports.GetAllResource = GetAllResource;
module.exports.GetAllResourceById = GetAllResourceById;
module.exports.AssignTaskToResource = AssignTaskToResource;
module.exports.UpdateAssignTaskToResource = UpdateAssignTaskToResource;
module.exports.GetTaskByResourceId = GetTaskByResourceId;
module.exports.AddAttributeToResource = AddAttributeToResource;
module.exports.EditAttributeToResource = EditAttributeToResource;
module.exports.DeleteAttributeToResource = DeleteAttributeToResource;
module.exports.ViewAttributeToResourceByResAttId = ViewAttributeToResourceByResAttId;
module.exports.ViewAttributeToResourceByResTaskId = ViewAttributeToResourceByResTaskId;
module.exports.ViewAttributeToResource = ViewAttributeToResource;
module.exports.GetResourceByTaskId=GetResourceByTaskId;
module.exports.RemoveTaskFromResource=RemoveTaskFromResource;
module.exports.RemoveAllTasksAssignToResource=RemoveAllTasksAssignToResource;