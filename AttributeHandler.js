/**
 * Created by Rajinda on 9/30/2015.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var DbConn = require('dvp-dbmodels');
var moment = require('moment');
var Sequelize = require('sequelize');


function CreateAttribute(attribute, attClass, attType, attCategory, tenantId, companyId, otherData, callback) {
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
            logger.info('[DVP-ResAttribute.CreateAttribute] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResAttribute.CreateAttribute] - [%s] - [PGSQL] - insertion  failed-[%s]', attribute, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function EditAttribute(attributeId, attribute, attClass, attType, attCategory, tenantId, companyId, otherData, callback) {
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
            logger.info('[DVP-ResAttribute.EditAttribute] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResAttribute.EditAttribute] - [%s] - [PGSQL] - insertion  failed-[%s]', attributeId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function DeleteAttribute(attributeId, tenantId, companyId, callback) {
    DbConn.ResAttribute
        .update(
        {
            Status: false
        },
        {where: [{AttributeId: attributeId}, {TenantId: tenantId}, {CompanyId: companyId}]}
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", cmp==1, cmp);
            logger.info('[DVP-ResAttribute.DeleteAttribute] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResAttribute.DeleteAttribute] - [%s] - [PGSQL] - insertion  failed-[%s]', attributeId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function GetAllAttributes(tenantId, companyId, callback) {

    DbConn.ResAttribute.findAll({where: [{Status: true}, {TenantId: tenantId}, {CompanyId: companyId}]}).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResAttribute.GetAllAttributes] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResAttribute.GetAllAttributes] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResAttribute.GetAllAttributes] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function GetAllAttributesPaging(tenantId, companyId, rowCount, pageNo, callback) {

    DbConn.ResAttribute.findAll({
        where: [{Status: true}, {TenantId: tenantId}, {CompanyId: companyId}], offset: ((pageNo - 1) * rowCount),
        limit: rowCount,
    }).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResAttribute.GetAllAttributesPaging] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
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
}

function GetAttributeById(attributeId, tenantId, companyId, callback) {

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
}

module.exports.CreateAttribute = CreateAttribute;
module.exports.EditAttribute = EditAttribute;
module.exports.DeleteAttribute = DeleteAttribute;
module.exports.GetAllAttributes = GetAllAttributes;
module.exports.GetAllAttributesPaging = GetAllAttributesPaging;
module.exports.GetAttributeById = GetAttributeById;