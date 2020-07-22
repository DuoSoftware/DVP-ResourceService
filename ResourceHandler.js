/**
 * Created by Rajinda on 9/29/2015.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var DbConn = require('dvp-dbmodels');
var moment = require('moment');
var Sequelize = require('sequelize');
var request = require('request');
var auditTrailsHandler = require('dvp-common/AuditTrail/AuditTrailsHandler.js');

function addAuditTrail(tenantId,companyId,iss,auditData){
  /*var auditData =  {
        KeyProperty: keyProperty,
            OldValue: auditTrails.OldValue,
        NewValue: auditTrails.NewValue,
        Description: auditTrails.Description,
        Author: auditTrails.Author,
        User: iss,
        OtherData: auditTrails.OtherData,
        ObjectType: auditTrails.ObjectType,
        Action: auditTrails.Action,
        Application: auditTrails.Application,
        TenantId: tenantId,
        CompanyId: companyId
    }*/

    try{
        auditTrailsHandler.CreateAuditTrails(tenantId,companyId,iss,auditData, function(err,obj){
            if(err){
                var jsonString = messageFormatter.FormatMessage(err, "Fail", false, auditData);
                logger.error('addAuditTrail -  Fail To Save Audit trail-[%s]', jsonString);
            }
        });
    }
    catch(ex){
        var jsonString = messageFormatter.FormatMessage(ex, "Fail", false, auditData);
        logger.error('addAuditTrail -  insertion  failed-[%s]', jsonString);
    }
}

var resourceNameIsExsists = function (resourceName,res) {

    var options = {
        method: 'GET',

        uri: "http://localhost:3636/DVP/API/1.0.0.0/User/"+resourceName+"/exsists", //Query string data
        headers: {
            'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkaW51c2hhZGNrIiwianRpIjoiYjExYzg3YjktMzYyNS00ZWE0LWFlZWMtYzE0NGEwNjZlM2I5Iiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjE4OTM2NTQyNzEsInRlbmFudCI6MSwiY29tcGFueSI6Mywic2NvcGUiOlt7InJlc291cmNlIjoiYWxsIiwiYWN0aW9ucyI6ImFsbCJ9XSwiaWF0IjoxNDYxNjUwNjcxfQ.j4zqaDSeuYIw5fy8AkiBTglyLpjV-Cucmlp1qdq9CfA"
        }
    };

    request(options, function (error, response, body) { //Checkout cart
        if (error) {
            jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            logger.error('[resourceNameIsExsists] - [%s] - [%s] - Error.', response, body, error);
            res.end(jsonString);
        }
        var jsonResp = JSON.parse(body);
        return jsonResp.Result;
    });

};

function CreateResource(resClass, resType, resCategory, tenantId, companyId, resourceName, otherData,iss, callback) {

    var tmpResource = {
        ResClass: resClass,
        ResType: resType,
        ResCategory: resCategory,
        TenantId: tenantId,
        CompanyId: companyId,
        ResourceName: resourceName,
        OtherData: otherData,
        Status: true
    };

    DbConn.ResResource
        .create(tmpResource
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResource.CreateResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            var auditData =  {
                KeyProperty: "ResourceName",
                OldValue: tmpResource,
                NewValue: tmpResource,
                Description: "New Resource Created.",
                Author: iss,
                User: iss,
                ObjectType: "ResResource",
                Action: "SAVE",
                Application: "Resource Service"
            };
            addAuditTrail(tenantId,companyId,iss,auditData);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResource.CreateResource] - [%s] - [PGSQL] - insertion  failed-[%s]', resourceName, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });

}

function EditResource(resourceId, resClass, resType, resCategory, tenantId, companyId, resourceName, otherData,iss, callback) {
    DbConn.ResResource
        .update(
        {
            ResClass: resClass,
            ResType: resType,
            ResCategory: resCategory,
            TenantId: tenantId,
            CompanyId: companyId,
            /*ResourceName: resourceName, not allow to edit. bcoz profile service not allow to edit*/
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
            var auditData =  {
                KeyProperty: "ResourceName",
                OldValue: resourceName,
                NewValue: resourceName,
                Description: "Update Resource.",
                Author: iss,
                User: iss,
                OtherJsonData: JSON.stringify(cmp),
                ObjectType: "ResResource",
                Action: "UPDATE",
                Application: "Resource Service"
            };
            addAuditTrail(tenantId,companyId,iss,auditData);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResource.EditResource] - [%s] - [PGSQL] - insertion  failed-[%s]', resourceId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function DeleteResource(resourceId,tenantId,companyId,iss,  callback) {
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
            var auditData =  {
                KeyProperty: "ResourceId",
                OldValue: resourceId,
                NewValue: resourceId,
                Description: "Delete Resource.",
                Author: iss,
                User: iss,
                OtherJsonData: JSON.stringify(cmp),
                ObjectType: "ResResource",
                Action: "DELETE",
                Application: "Resource Service"
            };
            addAuditTrail(tenantId,companyId,iss,auditData);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResource.DeleteResource] - [%s] - [PGSQL] - insertion  failed-[%s]', resourceId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function GetAllResource(tenantId, companyId, callback) {
    DbConn.ResResource.findAll({
        where: [{CompanyId: companyId}, {TenantId: tenantId}, {Status: true}],order: [['ResourceId', 'DESC']]
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

function GetResourceCount(tenantId, companyId, callback) {
    DbConn.ResResource.count({
        where: [{CompanyId: companyId}, {TenantId: tenantId}, {Status: true}]
    }).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResResource.GetResourceCount] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResResource.GetResourceCount] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResResource.GetResourceCount] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function GetAllResourcePage(req,tenantId, companyId, callback) {

    var pageNo = req.params.PageNo;
    var rowCount = req.params.RowCount;
    DbConn.ResResource.findAll({
        where: [{CompanyId: companyId}, {TenantId: tenantId}, {Status: true}],
        include: [{ model: DbConn.ResResourceTask, as: "ResResourceTask" }],
        offset: ((pageNo - 1) * rowCount),
        limit: rowCount,order: [['ResourceId', 'DESC']]
    }).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResResource.GetAllResourcePage] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResResource.GetAllResourcePage] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResResource.GetAllResourcePage] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
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

function AssignTaskToResource(resourceId,taskId,tenantId,companyId,concurrency,refInfo,otherData, iss,callback){

    var resTask =  {
        ResourceId: resourceId,
        TaskId: taskId,
        TenantId: tenantId,
        CompanyId: companyId,
        Concurrency: concurrency,
        RefInfo: refInfo,
        OtherData: otherData,
        Status: true
    }
    DbConn.ResResourceTask
        .create(
        {
            resTask
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceTask.AssignTaskToResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);

        var auditData = {
            KeyProperty: "ResourceId",
            OldValue: {},
            NewValue: resTask,
            Description: "Assign Task to resource",
            Author: iss,
            User: iss,
            ObjectType: "ResResourceTask",
            Action: "SAVE",
            Application: "Resource Service"
        };
        addAuditTrail(tenantId, companyId, iss, auditData);

            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceTask.AssignTaskToResource] - [%s] - [PGSQL] - insertion  failed-[%s]', resourceId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function UpdateAssignTaskToResource(resourceId,taskId,tenantId,companyId,concurrency,refInfo,otherData, iss, callback){

    var tempData = {
        Concurrency: concurrency,
        RefInfo: refInfo,
        OtherData: otherData,
        Status: true
    };

    DbConn.ResResourceTask
        .update(
        {
            tempData
        }
        ,
        {
            where:[{ResourceId:resourceId},{TaskId:taskId},{TenantId: tenantId},{CompanyId: companyId}]
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceTask.AssignTaskToResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);

        tempData.ResourceId = resourceId;
        var auditData = {
            KeyProperty: "ResourceName",
            OldValue: cmp,
            NewValue: tempData,
            Description: "Update Task to resource",
            Author: iss,
            User: iss,
            ObjectType: "ResResourceTask",
            Action: "UPDATE",
            Application: "Resource Service"
        };
        addAuditTrail(tenantId, companyId, iss, auditData);

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

function RemoveTaskFromResource(resourceId,taskId,tenantId,companyId, iss, callback){
    DbConn.ResResourceTask.destroy(
        {
            where :[{ResourceId:resourceId},{TaskId:taskId},{TenantId:tenantId},{CompanyId:companyId}]

        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceTask.RemoveTasFromResource] - [PGSQL] -  successfully. [%s] ', jsonString);

        var auditData = {
            KeyProperty: "ResourceId",
            OldValue: {
                ResourceId: resourceId},
            NewValue: {
                ResourceId: resourceId,
                TaskId: taskId},
            Description: "Delete Task from resource.",
            Author: iss,
            User: iss,
            OtherJsonData: JSON.stringify(cmp),
            ObjectType: "ResResourceTask",
            Action: "DELETE",
            Application: "Resource Service"
        };
        addAuditTrail(tenantId, companyId, iss, auditData);

            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceTask.RemoveTasFromResource] - [%s] - [PGSQL] -  failed-[%s]', taskId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function RemoveAllTasksAssignToResource(resourceId,tenantId,companyId, iss, callback){
    DbConn.ResResourceTask.destroy(
        {
            where :[{ResourceId:resourceId},{TenantId:tenantId},{CompanyId:companyId}]
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceTask.RemoveTasFromResource] - [PGSQL] -  successfully. [%s] ', jsonString);

        var auditData = {
            KeyProperty: "ResourceId",
            OldValue: {
                ResourceId: resourceId},
            NewValue: {
                ResourceId: resourceId},
            Description: "Delete All Task from resource.",
            Author: iss,
            User: iss,
            OtherJsonData: JSON.stringify(cmp),
            ObjectType: "ResResourceTask",
            Action: "DELETE",
            Application: "Resource Service"
        };
        addAuditTrail(tenantId, companyId, iss, auditData);

            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceTask.RemoveTasFromResource] - [%s] - [PGSQL] -  failed-[%s]', taskId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function AddAttributeToResource(params,body,tenantId,companyId, iss, callback){

    var attrib = {
        Percentage: body.Percentage,
        AttributeId: params.AttributeId,
        ResTaskId: params.ResTaskId,
        TenantId: tenantId,
        CompanyId: companyId,
        OtherData: body.OtherData,
        Status: true
    };

    DbConn.ResResourceAttributeTask
        .create(
        {
            attrib
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceAttributeTask] - [PGSQL] - inserted successfully. [%s] ', jsonString);

        var auditData = {
            KeyProperty: "ResourceName",
            OldValue: {},
            NewValue: attrib,
            Description: "Assign Attribute to Resource",
            Author: iss,
            User: iss,
            ObjectType: "ResResourceAttributeTask",
            Action: "SAVE",
            Application: "Resource Service"
        };
        addAuditTrail(tenantId, companyId, iss, auditData);

            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceAttributeTask] - [%s] - [PGSQL] - insertion  failed-[%s]', companyId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function EditAttributeToResource(params,body,tenantId,companyId, iss, callback){

    var attribs = {
        Percentage: body.Percentage,
        AttributeId: params.AttributeId,
        ResTaskId: params.ResTaskId,
        TenantId: tenantId,
        CompanyId: companyId,
        OtherData: body.OtherData,
        Status: true
    };

    DbConn.ResResourceAttributeTask
        .update(
        {
            attribs
        },{
        where: {
            ResAttId: params.ResAttId
        }
    }
    ).then(function (cmp) {

            var auditData = {
                KeyProperty: "ResourceId",
                OldValue: attribs,
                NewValue: attribs,
                Description: "Update Resource Attributes",
                Author: iss,
                User: iss,
                OtherJsonData: JSON.stringify(cmp),
                ObjectType: "ResResourceAttributeTask",
                Action: "UPDATE",
                Application: "Resource Service"
            };
            addAuditTrail(tenantId, companyId, iss, auditData);

            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-EditAttributeToResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-EditAttributeToResource] - [%s] - [PGSQL] - insertion  failed-[%s]', companyId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function DeleteAttributeToResource(params,body,tenantId,companyId, iss, callback){

    DbConn.ResResourceAttributeTask
        .destroy(
        {
            where: {
                ResAttId: params.ResAttId
            }
        }
    ).then(function (cmp) {

        var auditData = {
            KeyProperty: "ResourceAttributeId",
            OldValue: params.ResAttId,
            NewValue: params.ResAttId,
            Description: "Delete Resource Attribute.",
            Author: iss,
            User: iss,
            OtherJsonData: JSON.stringify(cmp),
            ObjectType: "ResResourceAttributeTask",
            Action: "DELETE",
            Application: "Resource Service"
        };
        addAuditTrail(tenantId, companyId, iss, auditData);

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
        .find({
            where: [{ResTaskId:params.ResTaskId},{TenantId:tenantId},{CompanyId:companyId},{Status: true}],
            //include: [{ model: DbConn.ResResourceAttributeTask,  as: "ResResourceAttributeTask" },{ model: DbConn.ResAttribute, as: "ResAttribute" }]
            include: [{ model: DbConn.ResResourceAttributeTask,  as: "ResResourceAttributeTask",include: [{ model: DbConn.ResAttribute,  as: "ResAttribute"}] }]
            //include: [{ model: DbConn.ResResource,  as: "ResResource" },{ model: DbConn.ResTask, as: "ResTask" ,include: [{ model: DbConn.ResTaskInfo, as: "ResTaskInfo" }]}]
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

function AddStatusChangeInfo(resourceId,tenantId,companyId,statusType,status,reason,otherData,callback){

    DbConn.ResResourceStatusChangeInfo
        .create(
        {
            ResourceId:resourceId,TenantId:tenantId,CompanyId:companyId,StatusType:statusType,Status:status,Reason:reason,OtherData:otherData
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceStatusChangeInfo.AddStatusChangeInfo] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceStatusChangeInfo.AddStatusChangeInfo] - [%s] - [PGSQL] - insertion  failed-[%s]', resourceId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function AddStatusDurationInfo(resourceId,tenantId,companyId,statusType,status,reason,otherData,sessionId,duration,callback){

    DbConn.ResResourceStatusDurationInfo
        .create(
        {
            TenantId:tenantId,CompanyId:companyId,ResourceId:resourceId,StatusType:statusType,Status:status,Reason:reason,SessionId:sessionId,OtherData:otherData,Duration:duration
        }
    ).then(function (cmp) {
            if(statusType === 'SloatStatus' && status === 'AfterWork') {
                DbConn.ResResourceAcwInfo
                    .create(
                    {
                        TenantId: tenantId,
                        CompanyId: companyId,
                        ResourceId: resourceId,
                        SessionId: sessionId,
                        Duration: duration
                    }
                ).then(function () {
                        logger.info('[DVP-ResResourceAcwInfo.AddStatusDurationInfo] - [PGSQL] - inserted successfully.');
                    }).error(function (err) {
                        logger.error('[DVP-ResResourceAcwInfo.AddStatusDurationInfo] - [%s] - [PGSQL] - insertion  failed-[%s]', resourceId, err);
                    });
            }

            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceStatusDurationInfo.AddStatusDurationInfo] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceStatusDurationInfo.AddStatusDurationInfo] - [%s] - [PGSQL] - insertion  failed-[%s]', resourceId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function AddTaskRejectInfo(resourceId,tenantId,companyId,task,reason,otherData,sessionId,callback){

    DbConn.ResResourceTaskRejectInfo
        .create(
        {
            TenantId:tenantId,CompanyId:companyId,ResourceId:resourceId,Task:task,Reason:reason,SessionId:sessionId,OtherData:otherData
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResResourceTaskRejectInfo.AddTaskRejectInfo] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResResourceTaskRejectInfo.AddTaskRejectInfo] - [%s] - [PGSQL] - insertion  failed-[%s]', resourceId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

module.exports.CreateResource = CreateResource;
module.exports.EditResource = EditResource;
module.exports.DeleteResource = DeleteResource;
module.exports.GetAllResource = GetAllResource;
module.exports.GetResourceCount = GetResourceCount;
module.exports.GetAllResourcePage = GetAllResourcePage;
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
module.exports.AddStatusChangeInfo=AddStatusChangeInfo;
module.exports.ResourceNameIsExsists=resourceNameIsExsists;
module.exports.AddStatusDurationInfo = AddStatusDurationInfo;
module.exports.AddTaskRejectInfo = AddTaskRejectInfo;