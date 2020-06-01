/**
 * Created by Waruna on 9/15/2017.
 */

var dbConn = require('dvp-dbmodels');
var messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common-lite/LogHandler/CommonLogHandler.js').logger;
var request = require('request');
var util = require('util');
var async = require("async");

module.exports.GetAgentPerformance = function (req, res) {

    var jsonString;
    var resourceId = req.params.ResourceId;

    var query = "SELECT date_trunc('day', \"createdAt\") AS \"Day\" ,SUM(\"TotalTime\") AS \"TotalTime\",SUM(\"TotalCount\") AS \"TotalCount\" FROM public.\"Dashboard_DailySummaries\" WHERE \"Param1\" = '" + resourceId + "' GROUP BY 1 ORDER BY 1 DESC LIMIT 2";

    dbConn.SequelizeConn.query(query, {type: dbConn.SequelizeConn.QueryTypes.SELECT})
        .then(function (workDates) {

            var functionList = [];
            if (workDates) {
                workDates.forEach(function (item) {
                    functionList.push(function (callback) {
                        var query = "SELECT date_trunc('day', \"createdAt\") AS \"Day\" ,(select SUM(\"TotalCount\") AS \"TotalRejectCount\" from public.\"Dashboard_DailySummaries\" where \"WindowName\" = 'AGENTREJECT' AND date_trunc('day', \"createdAt\")='" + item.Day.toISOString() + "'),(select SUM(\"TotalCount\") AS \"TotalAnswered\"  from public.\"Dashboard_DailySummaries\" where \"WindowName\" = 'CONNECTED' AND date_trunc('day', \"createdAt\")='" + item.Day.toISOString() + "'),(select SUM(\"TotalTime\") AS \"OnCallTime\" from public.\"Dashboard_DailySummaries\" where \"WindowName\" = 'CONNECTED' AND date_trunc('day', \"createdAt\")='" + item.Day.toISOString() + "') FROM public.\"Dashboard_DailySummaries\" WHERE date_trunc('day', \"createdAt\")='2016-06-14' GROUP BY 1;";

                        dbConn.SequelizeConn.query(query, {type: dbConn.SequelizeConn.QueryTypes.SELECT})
                            .then(function (records) {
                                callback(null, records)
                            }).error(function (err) {
                            callback(err, null)
                        });
                    })

                })
            }

            async.parallel(functionList, function (err, results) {
                if (err) {
                    logger.error('GetAgentPerformance -  - [PGSQL]  - Error in searching.-[%s]', err);
                    jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                    res.end(jsonString);
                }
                var calculatedResult = {
                    OnCallTime: 0,
                    TotalRejectCount: 0,
                    TotalAnswered: 0
                };
                if (results && results.length) {
                    var daybeforeOnCallTime = 0;
                    var todayOnCallTime = 0;
                    var daybeforeTotalRejectCount = 0;
                    var todayTotalRejectCount = 0;
                    var daybeforeTotalAnswered = 0;
                    var todayTotalTotalAnswered = 0;

                    if (results["0"]["0"]) {
                        todayOnCallTime = parseInt(results["0"]["0"].OnCallTime ? results["0"]["0"].OnCallTime : 0);
                        todayTotalRejectCount = parseInt(results["0"]["0"].TotalRejectCount ? results["0"]["0"].TotalRejectCount : 0);
                        todayTotalTotalAnswered = parseInt(results["0"]["0"].TotalAnswered ? results["0"]["0"].TotalAnswered : 0);
                    }
                    if (results["1"]["0"]) {
                        daybeforeOnCallTime = parseInt(results["1"]["0"].OnCallTime ? results["1"]["0"].OnCallTime : 0);
                        daybeforeTotalRejectCount = parseInt(results["1"]["0"].TotalRejectCount ? results["1"]["0"].TotalRejectCount : 0);
                        daybeforeTotalAnswered = parseInt(results["1"]["0"].TotalAnswered ? results["1"]["0"].TotalAnswered : 0);
                    }

                    calculatedResult.OnCallTime = ((daybeforeOnCallTime - todayOnCallTime) / daybeforeOnCallTime) * 100;
                    calculatedResult.TotalRejectCount = ((daybeforeTotalRejectCount - todayTotalRejectCount) / daybeforeTotalRejectCount) * 100;
                    calculatedResult.TotalAnswered = ((daybeforeTotalAnswered - todayTotalTotalAnswered) / daybeforeTotalAnswered) * 100;
                }

                logger.info('GetAgentPerformance -  - [PGSQL]  - [%s]', calculatedResult);
                jsonString = messageFormatter.FormatMessage(null, "EXCEPTION", true, calculatedResult);
                res.end(jsonString);
                // results is now equals to: {one: 1, two: 2}
            });


        }).error(function (err) {
        logger.error('GetAgentPerformance -  [PGSQL]  - Error in searching.-[%s]', err);
        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        res.end(jsonString);
    });

/*
    var query = "SELECT date_trunc('day', \"createdAt\") AS \"Day\" ,(select SUM(\"TotalCount\") AS \"TotalCount\" from public.\"Dashboard_DailySummaries\" where \"WindowName\" = 'AGENTREJECT' AND date_trunc('day', \"createdAt\")='2016-06-14'),(select SUM(\"TotalCount\") AS \"TotalCount\"  from public.\"Dashboard_DailySummaries\" where \"WindowName\" = 'CONNECTED' AND date_trunc('day', \"createdAt\")='2016-06-14'),(select SUM(\"TotalTime\") AS \"TotalTime\" from public.\"Dashboard_DailySummaries\" where \"WindowName\" = 'CONNECTED' AND date_trunc('day', \"createdAt\")='2016-06-14') FROM public.\"Dashboard_DailySummaries\" WHERE date_trunc('day', \"createdAt\")='2016-06-14' GROUP BY 1 ORDER BY 1 LIMIT 2;";

    dbConn.SequelizeConn.query(query, {type: dbConn.SequelizeConn.QueryTypes.SELECT})
        .then(function (records) {
            jsonString = messageFormatter.FormatMessage(undefined, "EXCEPTION", true, records);
            res.end(jsonString);
        }).error(function (err) {
        logger.error('[DVP-ResResource.GetDailySummaryRecords] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenant, company, err);
        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        res.end(jsonString);
    });*/

};
