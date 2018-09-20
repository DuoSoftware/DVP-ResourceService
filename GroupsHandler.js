/**
 * Created by Rajinda on 9/30/2015.
 */


var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var DbConn = require('dvp-dbmodels');
var moment = require('moment');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var uuid = require('node-uuid');


function CreateGroups(groupName, groupClass, groupType, groupCategory, tenantId, companyId, otherData,percentage, callback) {
    DbConn.ResGroups
        .create(
        {
            GroupName: groupName,
            GroupClass: groupClass,
            GroupType: groupType,
            GroupCategory: groupCategory,
            TenantId: tenantId,
            CompanyId: companyId,
            OtherData: otherData,
            Percentage:percentage,
            Status: true
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResGroups.CreateGroups] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResGroups.CreateGroups] - [%s] - [PGSQL] - insertion  failed-[%s]', groupName, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function EditGroups(groupId, groupName, groupClass, groupType, groupCategory, tenantId, companyId, otherData,percentage, callback) {
    DbConn.ResGroups
        .update(
        {
            GroupName: groupName,
            GroupClass: groupClass,
            GroupType: groupType,
            GroupCategory: groupCategory,
            TenantId: tenantId,
            CompanyId: companyId,
            OtherData: otherData,
            Percentage:percentage,
            Status: true
        },
        {where: [{GroupId: groupId}, {TenantId: tenantId}, {CompanyId: companyId}]}
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS",  cmp==1, cmp);
            logger.info('[DVP-ResGroups.EditGroups] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResGroups.EditGroups] - [%s] - [PGSQL] - insertion  failed-[%s]', groupId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}


function EditGroupAndAttachAttributes(req, tenantId, companyId, callback) {
    DbConn.ResGroups
        .update(
        {
            GroupName: req.body.GroupName,
            GroupClass: req.body.GroupClass,
            GroupType: req.body.GroupType,
            GroupCategory: req.body.GroupCategory,
            TenantId: tenantId,
            CompanyId: companyId,
            OtherData: req.body.OtherData,
            Percentage:req.body.Percentage,
            Status: true
        },
        {where: [{GroupId: req.params.GroupId}, {TenantId: tenantId}, {CompanyId: companyId}]}
    ).then(function (cmp) {

            var ids = [];
            req.body.Attributes.forEach(function(entry) {
              if(entry){
                  ids.push(entry.AttributeId);
              }
            });
            AddAttributeToExsistingGroups(ids,req.params.GroupId,tenantId,companyId,req.body.OtherData,callback);

        }).error(function (err) {
            logger.error('[DVP-ResGroups.EditGroups] - [%s] - [PGSQL] - insertion  failed-[%s]', groupId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}


function DeleteGroups(groupId, tenantId, companyId, callback) {
    DbConn.ResGroups
        .update(
        {
            Status: false
        },
        {where: [{GroupId: groupId}, {TenantId: tenantId}, {CompanyId: companyId}]}
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", cmp==1, cmp);
            logger.info('[DVP-ResGroups.DeleteGroups] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResGroups.DeleteGroups] - [%s] - [PGSQL] - insertion  failed-[%s]', groupId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function GetAllGroups(tenantId, companyId, callback) {

    DbConn.ResGroups.findAll({where: [{Status: true}, {TenantId: tenantId}, {CompanyId: companyId}],order: [['GroupId', 'DESC']], include: [{ model: DbConn.ResAttributeGroups,  as: "ResAttributeGroups", include:[{ model: DbConn.ResAttribute, as: "ResAttribute"   }] }]}).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResGroups.GetAllGroups] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResGroups.GetAllGroups] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResGroups.GetAllGroups] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function GroupsCount(tenantId, companyId, callback) {

    DbConn.ResGroups.count({where: [{Status: true}, {TenantId: tenantId}, {CompanyId: companyId}]}).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResGroups.GetAllGroups] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResGroups.GetAllGroups] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResGroups.GetAllGroups] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function AllowedGroupsCount(tenantId, companyId, callback) {

    DbConn.ResGroups.count({where: [{Status: true}, {TenantId: tenantId}, {CompanyId: companyId}, {GroupName: {[Op.notIn]:["Business Unit","User Group"]}}]}).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResGroups.AllowedGroupsCount] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResGroups.AllowedGroupsCount] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResGroups.AllowedGroupsCount] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function GetAllGroupsPaging(tenantId, companyId, rowCount, pageNo, callback) {

    DbConn.ResGroups.findAll({
        where: [{Status: true}, {TenantId: tenantId}, {CompanyId: companyId}],order: [['GroupId', 'DESC']], offset: ((pageNo - 1) * rowCount),
        limit: rowCount,
    }).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResGroups.GetAllGroupsPaging] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResGroups.GetAllGroupsPaging] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResGroups.GetAllGroupsPaging] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function GetAllowedGroupsPaging(tenantId, companyId, rowCount, pageNo, callback) {

    DbConn.ResGroups.findAll({
        where: [{Status: true}, {TenantId: tenantId}, {CompanyId: companyId}, {GroupName: {[Op.notIn]:["Business Unit","User Group"]}}],order: [['GroupId', 'DESC']], offset: ((pageNo - 1) * rowCount),
        limit: rowCount,
    }).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResGroups.GetAllowedGroupsPaging] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResGroups.GetAllowedGroupsPaging] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResGroups.GetAllowedGroupsPaging] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function GetGroupByGroupId(groupId, tenantId, companyId, callback) {

    DbConn.ResGroups.find({where: [{Status: true}, {GroupId: groupId}, {TenantId: tenantId}, {CompanyId: companyId}]}).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResGroups.GetGroupByGroupId] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResGroups.GetGroupByGroupId] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResAttribute.GetGroupByGroupId] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function GetGroupByGroupName(groupName, tenantId, companyId, callback) {

    DbConn.ResGroups.find({where: [{Status: true}, {GroupName: groupName}, {TenantId: tenantId}, {CompanyId: companyId}]}).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResGroups.GetGroupByGroupName] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResGroups.GetGroupByGroupName] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResAttribute.GetGroupByGroupName] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function DeleteAttributeFromGroup(groupId,attributeId ,tenantId, companyId, callback){
    DbConn.ResAttributeGroups
        .destroy(
        { where : [{AttributeId:attributeId},{GroupId:groupId},{TenantId:tenantId},{CompanyId:companyId}]
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", cmp==1, cmp);
            logger.info('[DVP-ResGroups.DeleteAttributeFromGroup] - [PGSQL] - delete successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResGroups.DeleteAttributeFromGroup] - [%s] - [PGSQL] - delete  failed-[%s]', groupId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function DeleteAttributesFromGroup(req ,tenantId, companyId, callback){
    DbConn.ResAttributeGroups
        .destroy(
        { where : [{AttributeId:req.body.AttributeIds},{GroupId:req.params.GroupId},{TenantId:tenantId},{CompanyId:companyId}]
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", cmp==1, cmp);
            logger.info('[DVP-ResGroups.DeleteAttributesFromGroup] - [PGSQL] - delete successfully. [%s] ', jsonString);
            callback.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-ResGroups.DeleteAttributesFromGroup] - [%s] - [PGSQL] - delete  failed-[%s]', groupId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function AddAttributeToGroups(AttributeIds, groupName, groupClass, groupType, groupCategory, tenantId, companyId, otherData, callback) {
    DbConn.ResGroups
        .create(
        {
            GroupName: groupName,
            GroupClass: groupClass,
            GroupType: groupType,
            GroupCategory: groupCategory,
            TenantId: tenantId,
            CompanyId: companyId,
            OtherData: otherData,
            Status: true
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-ResGroups.CreateGroups] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            AddAttributeToExsistingGroups(AttributeIds, cmp.GroupId, tenantId, companyId, otherData, callback)

        }).error(function (err) {
            logger.error('[DVP-ResGroups.CreateGroups] - [%s] - [PGSQL] - insertion  failed-[%s]', groupName, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
}

function AddAttributeToExsistingGroups(AttributeIds, groupId, tenantId, companyId, otherData, callback) {

    DbConn.ResGroups.find({where: [{Status: true}, {GroupId: groupId}, {TenantId: tenantId}, {CompanyId: companyId}]}).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResGroups.AddAttributeToExsistingGroups.GetGroupByGroupId] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var startTime = new Date();
            var nos = [];
            for (var i = 0; i < AttributeIds.length; i++) {
                var no = {
                    AttributeId: AttributeIds[i],
                    GroupId: groupId,
                    TenantId: tenantId,
                    CompanyId: companyId,
                    OtherData: otherData,
                    Status: true
                };
                nos.push(no);
            }

            DbConn.ResAttributeGroups.bulkCreate(
                nos, {validate: true, individualHooks: true}
            ).then(function (results) {
                    var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, results);
                    logger.info('[DVP-ResAttributeGroups.AddAttributeToGroup] - [PGSQL] - add attribute successfully.[%s] ', jsonString);
                    callback.end(jsonString);
                }).catch(function (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                    logger.error('[DVP-ResAttributeGroups.AddAttributeToGroup] - [%s] - [PGSQL] - add attribute  failed', companyId, err);
                    callback.end(jsonString);
                }).finally(function () {
                    logger.info('UploadContacts - %s - %s ms Done.', AttributeIds.length, (new Date() - startTime));
                });
        }
        else {
            logger.error('[DVP-ResGroups.AddAttributeToExsistingGroups.GetGroupByGroupId] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('Invalid Group ID'), "EXCEPTION", false, undefined);
            callback.end(jsonString);

        }
    }).error(function (err) {
        logger.error('[DVP-ResAttribute.AddAttributeToExsistingGroups.GetGroupByGroupId] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);

    });


}

function AddOneAttributeToExsistingGroups(attributeId, groupId, tenantId, companyId, otherData, callback) {

    DbConn.ResGroups.find({where: [{Status: true}, {GroupId: groupId}, {TenantId: tenantId}, {CompanyId: companyId}]}).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResGroups.AddOneAttributeToExsistingGroups.GetGroupByGroupId] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var startTime = new Date();

           DbConn.ResAttributeGroups
                .create(
                {
                    AttributeId: attributeId,
                    GroupId: groupId,
                    TenantId: tenantId,
                    CompanyId: companyId,
                    OtherData: otherData,
                    Status: true
                }
            ).then(function (results) {
                    var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, results);
                    logger.info('[DVP-ResAttributeGroups.AddOneAttributeToExsistingGroups] - [PGSQL] - add attribute successfully.[%s] ', jsonString);
                    callback.end(jsonString);
                }).catch(function (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                    logger.error('[DVP-ResAttributeGroups.AddOneAttributeToExsistingGroups] - [%s] - [PGSQL] - add attribute  failed', companyId, err);
                    callback.end(jsonString);
                }).finally(function () {
                    logger.info('UploadContacts - %s - %s ms Done.', attributeId, (new Date() - startTime));
                });
        }
        else {
            logger.error('[DVP-ResGroups.AddOneAttributeToExsistingGroups.GetGroupByGroupId] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('Invalid Group ID'), "EXCEPTION", false, undefined);
            callback.end(jsonString);

        }
    }).error(function (err) {
        logger.error('[DVP-ResAttribute.AddOneAttributeToExsistingGroups.GetGroupByGroupId] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);

    });


}

function GetAttributeByGroupId(groupId, tenantId, companyId, callback) {
    DbConn.ResAttributeGroups.findAll({where: [{GroupId: groupId}, {Status: true}, {TenantId: tenantId}, {CompanyId: companyId}]}).then(function (CamObject) {
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
}

function GetAttributeByGroupIdWithDetails(groupId, tenantId, companyId, callback) {

    DbConn.ResGroups.find({
        where: [{GroupId: groupId}, {Status: true}, {TenantId: tenantId}, {CompanyId: companyId}], include: [{ model: DbConn.ResAttributeGroups,  as: "ResAttributeGroups", include:[{ model: DbConn.ResAttribute, as: "ResAttribute"   }] }]}
    ).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResAttributeGroups.GetAttributeByGroupIdWithDetails] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResAttributeGroups.GetAttributeByGroupIdWithDetails] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResAttributeGroups.GetAttributeByGroupIdWithDetails] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });

    /*
     DbConn.ResAttributeGroups.findAll({
     where: [{GroupId: groupId}, {Status: true}, {TenantId: tenantId}, {CompanyId: companyId}],
     include: [{ model: DbConn.ResGroups,  as: "ResGroups" },
     { model: DbConn.ResAttribute, as: "ResAttribute"   }
     ]
     }
     */
}

function GetGroupDetailsByAttributeId(attributeId, tenantId, companyId, callback) {
    DbConn.ResAttributeGroups.findAll({
        where: [{AttributeId: attributeId}, {Status: true}, {TenantId: tenantId}, {CompanyId: companyId}],
        include: [{ model: DbConn.ResGroups,  as: "ResGroups" },
            { model: DbConn.ResAttribute, as: "ResAttribute"   }
        ]
    }).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResAttributeGroups.GetAttributeByGroupIdWithDetails] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            callback.end(jsonString);
        }
        else {
            logger.error('[DVP-ResAttributeGroups.GetAttributeByGroupIdWithDetails] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            callback.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResAttributeGroups.GetAttributeByGroupIdWithDetails] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
}

function GetAllGroupNames(req, res) {

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
        var jsonString = messageFormatter.FormatMessage(new Error("Invalid Authorization details found "), "ERROR/EXCEPTION", false, undefined);
        logger.error('[DVP-ResGroups.GetAllGroupNames] - [%s] - Unauthorized access  ', reqId);
        res.end(jsonString);
    }

    DbConn.ResGroups.findAll({where: [{Status: true}, {TenantId: req.user.tenant}, {CompanyId: req.user.company}],attributes: ['GroupName', 'GroupId'],order: [['GroupId', 'DESC']]}).then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResGroups.GetAllGroupNames] - [%s] - [PGSQL]  - Data found  - %s-[%s]', req.user.tenant, req.user.company, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            res.end(jsonString);
        }
        else {
            logger.error('[DVP-ResGroups.GetAllGroupNames] - [PGSQL]  - No record found for %s - %s  ', req.user.tenant, req.user.company);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResGroups.GetAllGroupNames] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', req.user.tenant, req.user.company, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        res.end(jsonString);
    });
}

module.exports.CreateGroups = CreateGroups;
module.exports.EditGroups = EditGroups;
module.exports.EditGroupAndAttachAttributes=EditGroupAndAttachAttributes;
module.exports.DeleteGroups = DeleteGroups;
module.exports.GetAllGroups = GetAllGroups;
module.exports.GroupsCount = GroupsCount;
module.exports.GetAllGroupsPaging = GetAllGroupsPaging;
module.exports.GetGroupByGroupId = GetGroupByGroupId;
module.exports.AddAttributeToGroups = AddAttributeToGroups;
module.exports.AddAttributeToExsistingGroups = AddAttributeToExsistingGroups;
module.exports.AddOneAttributeToExsistingGroups = AddOneAttributeToExsistingGroups;
module.exports.GetAttributeByGroupId = GetAttributeByGroupId;
module.exports.GetAttributeByGroupIdWithDetails = GetAttributeByGroupIdWithDetails;
module.exports.GetGroupDetailsByAttributeId = GetGroupDetailsByAttributeId;
module.exports.DeleteAttributeFromGroup = DeleteAttributeFromGroup;
module.exports.DeleteAttributesFromGroup = DeleteAttributesFromGroup;
module.exports.GetAllGroupNames = GetAllGroupNames;
module.exports.GetAllowedGroupsPaging = GetAllowedGroupsPaging;
module.exports.AllowedGroupsCount = AllowedGroupsCount;
module.exports.GetGroupByGroupName = GetGroupByGroupName;

