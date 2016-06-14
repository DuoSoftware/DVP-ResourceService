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

var GetDailySummaryRecords = function(tenant, company, summaryDate, callback){
    dbConn.SequelizeConn.query("SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '"+company+"' and \"Tenant\" = '"+tenant+"' and \"SummaryDate\"::date = date '"+summaryDate+"' and \"WindowName\" in (	SELECT \"WindowName\"	FROM \"Dashboard_DailySummaries\"		WHERE \"WindowName\" = 'LOGIN' or \"WindowName\" = 'CONNECTED' or \"WindowName\" = 'AFTERWORK' or \"WindowName\" = 'BREAK') union SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '"+company+"' and \"Tenant\" = '"+tenant+"' and \"SummaryDate\"::date = date '"+summaryDate+"' and \"WindowName\" = 'AGENTREJECT'", { type: dbConn.SequelizeConn.QueryTypes.SELECT})
        .then(function(records) {
            if (records) {
                logger.info('[DVP-ResResource.GetDailySummaryRecords] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenant, company, JSON.stringify(records));
                var loginSessions = [];
                for(var i in records){
                    var record = records[i];
                    if(record.WindowName == "AGENTREJECT"){
                        var rSession = FilterObjFromArray(loginSessions, "resourceId", record.Param2);
                        if (rSession) {
                            rSession.records.push(record);
                        } else {
                            loginSessions.push({resourceId: record.Param2, records: [record]});
                        }
                    }else {
                        var session = FilterObjFromArray(loginSessions, "resourceId", record.Param1);
                        if (session) {
                            session.records.push(record);
                        } else {
                            loginSessions.push({resourceId: record.Param1, records: [record]});
                        }
                    }
                }
                var DailySummary = [];
                for(var j in loginSessions){
                    var loginSession = loginSessions[j];

                    var login = FilterObjFromArray(loginSession.records, "WindowName", "LOGIN");
                    var connected = FilterObjFromArray(loginSession.records, "WindowName", "CONNECTED");
                    var rBreak = FilterObjFromArray(loginSession.records, "WindowName", "BREAK");
                    var agentReject = FilterObjFromArray(loginSession.records, "WindowName", "AGENTREJECT");
                    var afterWork = FilterObjFromArray(loginSession.records, "WindowName", "AFTERWORK");

                    var summary = {};
                    if(login){
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
                        if(connected){
                            summary.TalkTime = connected.TotalTime;
                            summary.TotalAnswered = connected.TotalCount;
                            summary.TotalCalls = connected.TotalCount;
                            if(connected.TotalCount > 0){
                                summary.AverageHandlingTime = connected.TotalTime/connected.TotalCount;
                            }else{
                                summary.AverageHandlingTime = 0;
                            }
                        }
                        if(rBreak){
                            summary.BreakTime = rBreak.TotalTime;
                        }
                        if(agentReject){
                            summary.TotalCalls = summary.TotalCalls + agentReject.TotalCount;
                        }
                        if(afterWork){
                            summary.AfterWorkTime = afterWork.TotalTime;
                        }
                        summary.IdleTime = summary.StaffTime - (summary.AfterWorkTime + summary.BreakTime + summary.TalkTime);
                        DailySummary.push(summary);
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