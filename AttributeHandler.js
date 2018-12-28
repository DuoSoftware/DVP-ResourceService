/**
 * Created by Rajinda on 9/30/2015.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var DbConn = require('dvp-dbmodels');
var moment = require('moment');


module.exports.CreateAttribute =function (attribute, attClass, attType, attCategory, tenantId, companyId, otherData, callback,req_id) {
    DbConn.ResAttribute
        .create(
        {
            Attribute: attribute,
            AttClass: attClass,
            AttType: attType,
            AttCategory: attCategory,
            TenantId: tenantId,
            CompanyId: companyId,
            OtherData: otherData,
            Status: true
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info("resource_service",{req_id: req_id,action:"Successfully CreateAttribute",tenant_id:tenantId,company_id:companyId,req_data: undefined,res_data:JSON.stringify(cmp),Exception:undefined});
            callback.end(jsonString);
        }).error(function (err) {
            logger.error("resource_service",{req_id: req_id,action:"Fail to CreateAttribute. Error Occurred",tenant_id:tenantId,company_id:companyId,req_data: undefined,res_data:undefined,Exception:err.message});
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
};

module.exports.EditAttribute=function (attributeId, attribute, attClass, attType, attCategory, tenantId, companyId, otherData, callback,req_id) {
    DbConn.ResAttribute
        .update(
        {
            Attribute: attribute,
            AttClass: attClass,
            AttType: attType,
            AttCategory: attCategory,
            OtherData: otherData,
            Status: true
        },
        {where: [{AttributeId: attributeId}, {TenantId: tenantId}, {CompanyId: companyId}]}
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", cmp==1, cmp);
            logger.info("resource_service",{req_id: req_id,action:"Successfully Update Attribute",tenant_id:tenantId,company_id:companyId,req_data: undefined,res_data:JSON.stringify(cmp),Exception:undefined});

        callback.end(jsonString);
        }).error(function (err) {
            logger.error("resource_service",{req_id: req_id,action:"Fail to Edit Attribute. Error Occurred",tenant_id:tenantId,company_id:companyId,req_data: undefined,res_data:undefined,Exception:err.message});
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
};

module.exports.DeleteAttribute=function(attributeId, tenantId, companyId, callback,req_id) {
    DbConn.ResAttribute
        .update(
        {
            Status: false
        },
        {where: [{AttributeId: attributeId}, {TenantId: tenantId}, {CompanyId: companyId}]}
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", cmp==1, cmp);
        logger.info("resource_service",{req_id: req_id,action:"Successfully Delete Attribute",tenant_id:tenantId,company_id:companyId,req_data: JSON.stringify(cmp),res_data:undefined,Exception:undefined});
            callback.end(jsonString);
        }).error(function (err) {
            logger.error("resource_service",{req_id: req_id,action:"Fail to Delete Attribute. Error Occurred",tenant_id:tenantId,company_id:companyId,req_data: undefined,res_data:undefined,Exception:err.message});
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
};

module.exports.GetAllAttributes =function(tenantId, companyId, callback,req_id) {

    DbConn.ResAttribute.findAll({where: [{Status: true}, {TenantId: tenantId}, {CompanyId: companyId}],order: [['AttributeId', 'DESC']]}).then(function (CamObject) {

        if (CamObject) {
            logger.info("Get All Attributes",{req_id: req_id,action:"Get All Attributes DB method",tenant_id:tenantId,company_id:companyId,req_data: undefined,res_data:JSON.stringify(CamObject),Exception:undefined});
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);
            callback.end(jsonString);
        }
        else {
            logger.error("Fail To Get All Attributes - No record found",{req_id: req_id,action:"Fail To Get All Attributes - No record found",tenant_id:tenantId,company_id:companyId,req_data: undefined,res_data:undefined,exception_message:"No record found"});
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error("Fail To Get All Attributes DB",{req_id: req_id,action:"Fail To Get All Attributes - db",tenant_id:tenantId,company_id:companyId,req_data: undefined,res_data:undefined,exception_message:err.message});
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
};

module.exports.GetAllAttributeCount=function(tenantId, companyId, callback,req_id) {

    DbConn.ResAttribute.count({where: [{Status: true}, {TenantId: tenantId}, {CompanyId: companyId}]}).then(function (CamObject) {
        if (CamObject) {
            logger.info("Get All Attributes Count DB",{req_id: req_id,action:"Get All Attributes Count DB",tenant_id:tenantId,company_id:companyId,req_data: undefined,res_data:JSON.stringify(CamObject),Exception:undefined});

            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error("Fail To Get Attributes Count DB",{req_id: req_id,action:"Fail To Get Attributes Count DB",tenant_id:tenantId,company_id:companyId,req_data: undefined,res_data:undefined,Exception:"No record found"});

            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error("Fail To Get Attributes Count DB",{req_id: req_id,action:"Fail To Get Attributes Count DB",tenant_id:tenantId,company_id:companyId,req_data: undefined,res_data:undefined,Exception:err.message});

        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
};


module.exports.GetAllAttributesPaging =function(tenantId, companyId, rowCount, pageNo, callback) {

    DbConn.ResAttribute.findAll({
        where: [{Status: true}, {TenantId: tenantId}, {CompanyId: companyId}], offset: ((pageNo - 1) * rowCount),
        limit: rowCount,order: [['AttributeId', 'DESC']]
    }).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResAttribute.GetAllAttributesPaging] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            //logger.info("Invoke Get All Attributes Paging method-DB",{action:"Invoke Get All Attributes Count method-DB",tenant_id:tenantId,company_id:companyId,req_data: req.params,res_data:JSON.stringify(CamObject),Exception:undefined});

            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResAttribute.GetAllAttributesPaging] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResAttribute.GetAllAttributesPaging] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
};

module.exports.GetAttributeById = function (attributeId, tenantId, companyId, callback) {

    DbConn.ResAttribute.find({where: [{Status: true}, {AttributeId: attributeId}, {TenantId: tenantId}, {CompanyId: companyId}]}).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResAttribute.GetAttributeById] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResAttribute.GetAttributeById] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResAttribute.GetAttributeById] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
};

module.exports.GetAttributeByGroupId = function (groupId, tenantId, companyId, callback) {

    DbConn.ResAttributeGroups.findAll({
            where: [{GroupId: groupId}, {Status: true}, {TenantId: tenantId}, {CompanyId: companyId}], include:[{ model: DbConn.ResAttribute, as: "ResAttribute"   }]}
    ).then(function (CamObject) {
            if (CamObject) {
                logger.info('[DVP-ResAttributeGroups.GetAttributeByGroupId] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

                callback.end(jsonString);
            }
            else {
                logger.error('[DVP-ResAttributeGroups.GetAttributeByGroupId] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
                var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
                callback.end(jsonString);
            }
        }).error(function (err) {
            logger.error('[DVP-ResAttributeGroups.GetAttributeByGroupId] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
};


