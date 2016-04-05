/**
 * Created by Rajinda on 4/5/2016.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var DbConn = require('dvp-dbmodels');


module.exports.SharedResource = function (tenantId, companyId, req, res) {


    DbConn.ResResource
        .update(
        {
            ShareStatus: true
        },
        {
            where: [{ResourceId: req.params.ResourceId}, {TenantId: tenantId}, {CompanyId: companyId}]
        }
    ).then(function (cmp) {
            if (cmp == 1) {
                DbConn.ResSharedResource
                    .create(
                    {
                        TaskId: req.params.TaskId,
                        ResourceId: req.params.ResourceId
                    }
                ).then(function (cmp) {
                        var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
                        logger.info('[DVP-SharedResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);
                        res.end(jsonString);
                    }).error(function (err) {
                        logger.error('[DVP-SharedResource] - [%s] - [PGSQL] - insertion  failed-[%s]', req.params.ResourceId, err);
                        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                        res.end(jsonString);
                    });
            }
            else {
                logger.error('[DVP-SharedResource] - [%s] - [PGSQL] - insertion  failed-[%s]', req.params.ResourceId, new Error("No data."));
                var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                res.end(jsonString);
            }
        }).error(function (err) {
            logger.error('[SharedResource] - [%s] - [PGSQL] - insertion  failed-[%s]', req.params.ResourceId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        });


};

module.exports.GetSharedResource = function (tenantId, companyId, req, res) {
    DbConn.ResSharedResource.findAll().then(function (CamObject) {
        if (CamObject) {
            logger.info('[DVP-ResResource.GetAllResource] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenantId, companyId, JSON.stringify(CamObject));
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);

            res.end(jsonString);
        }
        else {
            logger.error('[DVP-ResResource.GetAllResource] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-ResResource.GetAllResource] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenantId, companyId, err);
        var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
};

module.exports.AssignTaskToResource = function (tenantId, companyId,req,res) {

    DbConn.ResResourceTask
        .create(
        {
            ResourceId: req.params.ResourceId,
            TaskId: req.params.TaskId,
            TenantId: tenantId,
            CompanyId: companyId,
            Concurrency: req.body.Concurrency,
            RefInfo: req.body.RefInfo,
            OtherData: req.body.OtherData,
            Status: true,
            SharedAccepted: true
        }
    ).then(function (cmp) {
            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
            logger.info('[DVP-Shared.AssignTaskToResource] - [PGSQL] - inserted successfully. [%s] ', jsonString);
            res.end(jsonString);
        }).error(function (err) {
            logger.error('[DVP-Shared.AssignTaskToResource] - [%s] - [PGSQL] - insertion  failed-[%s]', req.params.ResourceId, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            res.end(jsonString);
        });
};