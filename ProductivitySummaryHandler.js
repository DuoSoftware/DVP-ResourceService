/**
 * Created by Heshan.i on 6/14/2016.
 */
var dbConn = require('dvp-dbmodels');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var request = require('request');
var util = require('util');

function FilterObjFromArray(itemArray, field, value){
    var resultObj;
    for(var i in itemArray){
        var item = itemArray[i];
        if(item[field] == value){
            resultObj = item;
            break;
        }
    }
    return resultObj;
}

function FilterAllObjsFromArray(itemArray, field, value){
    var filterData = itemArray.filter(function (item) {
        if(item[field] === value){
            return item;
        }
    });

    return filterData;
}

var GetDailySummaryRecords = function(tenant, company, summaryFromDate, summaryToDate, callback){
    dbConn.SequelizeConn.query("SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '"+company+"' and \"Tenant\" = '"+tenant+"' and \"SummaryDate\"::date >= date '"+summaryFromDate+"' and \"SummaryDate\"::date <= date '"+summaryToDate+"' and \"WindowName\" in (	SELECT \"WindowName\"	FROM \"Dashboard_DailySummaries\"		WHERE \"WindowName\" = 'LOGIN' or \"WindowName\" = 'CONNECTED' or \"WindowName\" = 'AFTERWORK' or \"WindowName\" = 'BREAK') union SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '"+company+"' and \"Tenant\" = '"+tenant+"' and \"SummaryDate\"::date >= date '"+summaryFromDate+"' and \"SummaryDate\"::date <= date '"+summaryToDate+"' and \"WindowName\" = 'AGENTREJECT'", { type: dbConn.SequelizeConn.QueryTypes.SELECT})
        .then(function(records) {
            if (records) {
                logger.info('[DVP-ResResource.GetDailySummaryRecords] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenant, company, JSON.stringify(records));
                var loginSessions = [];
                for(var i in records){
                    var record = records[i];
                    var loginDateInfo = FilterObjFromArray(loginSessions, "loginDate", record.SummaryDate.toDateString());
                    if(!loginDateInfo){
                        loginDateInfo = {loginDate:record.SummaryDate.toDateString(), sessionInfos:[]};
                        loginSessions.push(loginDateInfo);
                    }

                    if(record.WindowName == "AGENTREJECT"){
                        var rSession = FilterObjFromArray(loginDateInfo.sessionInfos, "resourceId", record.Param2);
                        if (rSession) {
                            rSession.records.push(record);
                        } else {
                            loginDateInfo.sessionInfos.push({resourceId: record.Param2, records: [record]});
                        }
                    }else {
                        var session = FilterObjFromArray(loginDateInfo.sessionInfos, "resourceId", record.Param1);
                        if (session) {
                            session.records.push(record);
                        } else {
                            loginDateInfo.sessionInfos.push({resourceId: record.Param1, records: [record]});
                        }
                    }
                }
                var DailySummary = [];
                for(var t in loginSessions) {
                    var dateInfo = loginSessions[t];
                    for (var j in dateInfo.sessionInfos) {
                        var loginSession = dateInfo.sessionInfos[j];

                        var login = FilterObjFromArray(loginSession.records, "WindowName", "LOGIN");
                        var connected = FilterAllObjsFromArray(loginSession.records, "WindowName", "CONNECTED");
                        var rBreak = FilterAllObjsFromArray(loginSession.records, "WindowName", "BREAK");
                        var agentReject = FilterAllObjsFromArray(loginSession.records, "WindowName", "AGENTREJECT");
                        var afterWork = FilterObjFromArray(loginSession.records, "WindowName", "AFTERWORK");

                        var summary = {};
                        if (login) {

                            var summaryDate = FilterObjFromArray(DailySummary, "Date", login.SummaryDate.toDateString());
                            if(!summaryDate){
                                summaryDate = {Date: login.SummaryDate.toDateString(), Summary: []};
                                DailySummary.push(summaryDate);
                            }
                            summary.Agent = login.Param1;
                            summary.StaffTime = login.TotalTime;
                            summary.Date = login.SummaryDate;
                            summary.TalkTime = 0;
                            summary.TotalAnswered = 0;
                            summary.TotalCalls = 0;
                            summary.AverageHandlingTime = 0;
                            summary.BreakTime = 0;
                            summary.AfterWorkTime = 0;
                            summary.IdleTime = 0;
                            if (connected && connected.length > 0) {

                                connected.forEach(function (cItem) {
                                    summary.TalkTime = summary.TalkTime + cItem.TotalTime;
                                    summary.TotalAnswered = summary.TotalAnswered + cItem.TotalCount;
                                    summary.TotalCalls = summary.TotalCalls + cItem.TotalCount;

                                });

                                if (summary.TotalCalls > 0) {
                                    summary.AverageHandlingTime = summary.TalkTime / summary.TotalCalls;
                                } else {
                                    summary.AverageHandlingTime = 0;
                                }

                            }
                            if (rBreak) {
                                rBreak.forEach(function (bItem) {
                                    summary.BreakTime = summary.BreakTime + bItem.TotalTime;
                                });

                            }
                            if (agentReject) {
                                agentReject.forEach(function (rItem) {
                                    summary.TotalCalls = summary.TotalCalls + rItem.TotalCount;
                                });

                            }
                            if (afterWork) {
                                summary.AfterWorkTime = afterWork.TotalTime;
                            }
                            summary.IdleTime = summary.StaffTime - (summary.AfterWorkTime + summary.BreakTime + summary.TalkTime);
                            summaryDate.Summary.push(summary);
                        }
                    }
                }

                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, DailySummary);

                callback.end(jsonString);
            }
            else {
                logger.error('[DVP-ResResource.GetDailySummaryRecords] - [PGSQL]  - No record found for %s - %s  ', tenant, company);
                var jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
                callback.end(jsonString);
            }
        }).error(function (err) {
            logger.error('[DVP-ResResource.GetDailySummaryRecords] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenant, company, err);
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
};

module.exports.GetDailySummaryRecords = GetDailySummaryRecords;