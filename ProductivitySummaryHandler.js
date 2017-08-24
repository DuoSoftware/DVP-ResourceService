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

var GetDailySummaryRecords = function(tenant, company, summaryFromDate, summaryToDate, resourceId, callback){
    var jsonString;
    var query = "SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '"+company+"' and \"Tenant\" = '"+tenant+"' and \"SummaryDate\"::date >= date '"+summaryFromDate+"' and \"SummaryDate\"::date <= date '"+summaryToDate+"' and \"WindowName\" in (	SELECT \"WindowName\"	FROM \"Dashboard_DailySummaries\"		WHERE \"WindowName\" = 'LOGIN' or \"WindowName\" = 'CONNECTED' or \"WindowName\" = 'AFTERWORK' or \"WindowName\" = 'BREAK') union SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '"+company+"' and \"Tenant\" = '"+tenant+"' and \"SummaryDate\"::date >= date '"+summaryFromDate+"' and \"SummaryDate\"::date <= date '"+summaryToDate+"' and \"WindowName\" = 'AGENTREJECT'";

    if(resourceId)
    {
        query = "SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '"+company+"' and \"Tenant\" = '"+tenant+"' and \"Param1\" = '"+resourceId+"' and \"SummaryDate\"::date >= date '"+summaryFromDate+"' and \"SummaryDate\"::date <= date '"+summaryToDate+"' and \"WindowName\" in (	SELECT \"WindowName\"	FROM \"Dashboard_DailySummaries\"		WHERE \"WindowName\" = 'LOGIN' or \"WindowName\" = 'CONNECTED' or \"WindowName\" = 'AFTERWORK' or \"WindowName\" = 'BREAK') union SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '"+company+"' and \"Tenant\" = '"+tenant+"' and \"Param1\" = '"+resourceId+"' and \"SummaryDate\"::date >= date '"+summaryFromDate+"' and \"SummaryDate\"::date <= date '"+summaryToDate+"' and \"WindowName\" = 'AGENTREJECT'";
    }
    dbConn.SequelizeConn.query(query, { type: dbConn.SequelizeConn.QueryTypes.SELECT})
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

                        var loginRecords = FilterAllObjsFromArray(loginSession.records, "WindowName", "LOGIN");
                        var inboundRecords = FilterAllObjsFromArray(loginSession.records, "WindowName", "INBOUND");
                        var outboundRecords = FilterAllObjsFromArray(loginSession.records, "WindowName", "OUTBOUND");
                        var connected = FilterAllObjsFromArray(loginSession.records, "WindowName", "CONNECTED");
                        var rBreak = FilterAllObjsFromArray(loginSession.records, "WindowName", "BREAK");
                        var agentReject = FilterAllObjsFromArray(loginSession.records, "WindowName", "AGENTREJECT");
                        var afterWork = FilterAllObjsFromArray(loginSession.records, "WindowName", "AFTERWORK");
                        var holdRecords = FilterAllObjsFromArray(loginSession.records, "WindowName", "AGENTHOLD");
                        var login = {};

                        var summary = {};
                        if(loginRecords && loginRecords.length> 0){
                            login.SummaryDate = loginRecords[0].SummaryDate;
                            login.Param1 = loginRecords[0].Param1;
                            login.TotalTime = 0;
                            login.InboundTime = 0;
                            login.OutboundTime = 0;

                            loginRecords.forEach(function (loginR) {
                                if(loginR && loginR.TotalTime >0){
                                    login.TotalTime = login.TotalTime + loginR.TotalTime;
                                }
                            });

                            inboundRecords.forEach(function (inboundR) {
                                if(inboundR && inboundR.TotalTime >0){
                                    login.InboundTime = login.InboundTime + inboundR.TotalTime;
                                }
                            });

                            outboundRecords.forEach(function (outboundR) {
                                if(outboundR && outboundR.TotalTime >0){
                                    login.OutboundTime = login.OutboundTime + outboundR.TotalTime;
                                }
                            });



                            var summaryDate = FilterObjFromArray(DailySummary, "Date", login.SummaryDate.toDateString());
                            if(!summaryDate){
                                summaryDate = {Date: login.SummaryDate.toDateString(), Summary: []};
                                DailySummary.push(summaryDate);
                            }

                            summary.Date = login.SummaryDate;
                            summary.Agent = login.Param1;
                            summary.StaffTime = login.TotalTime;
                            summary.InboundTime = login.InboundTime;
                            summary.OutboundTime = login.OutboundTime;
                            summary.TalkTimeInbound = 0;
                            summary.TalkTimeOutbound = 0;
                            summary.AvgTalkTimeInbound = 0;
                            summary.AvgTalkTimeOutbound = 0;
                            summary.TotalAnswered = 0;
                            summary.TotalCallsInbound = 0;
                            summary.TotalCallsOutbound = 0;
                            summary.AverageHandlingTimeInbound = 0;
                            summary.AverageHandlingTimeOutbound = 0;
                            summary.BreakTime = 0;
                            summary.AfterWorkTimeInbound = 0;
                            summary.AfterWorkTimeOutbound = 0;
                            summary.IdleTimeInbound = 0;
                            summary.IdleTimeOutbound = 0;
                            summary.IdleTimeOffline = 0;
                            summary.TotalHoldInbound = 0;
                            summary.TotalHoldTimeInbound = 0;
                            summary.AvgHoldTimeInbound = 0;
                            summary.TotalHoldOutbound = 0;
                            summary.TotalHoldTimeOutbound = 0;
                            summary.AvgHoldTimeOutbound = 0;


                            if (holdRecords) {
                                holdRecords.forEach(function (hItem) {
                                    if(hItem.Param2 === 'outbound'){
                                        summary.TotalHoldOutbound = summary.TotalHoldOutbound + hItem.TotalCount;
                                        summary.TotalHoldTimeOutbound = summary.TotalHoldTimeOutbound + hItem.TotalTime;
                                    }else if(hItem.Param2 === 'inbound'){
                                        summary.TotalHoldInbound = summary.TotalHoldInbound + hItem.TotalCount;
                                        summary.TotalHoldTimeInbound = summary.TotalHoldTimeInbound + hItem.TotalTime;
                                    }
                                });
                            }

                            if (connected && connected.length > 0) {

                                connected.forEach(function (cItem) {

                                    if(cItem.Param2 === 'CALLoutbound'){
                                        summary.TalkTimeOutbound = summary.TalkTimeOutbound + cItem.TotalTime;
                                        summary.TotalCallsOutbound = summary.TotalCallsOutbound + cItem.TotalCount;
                                    }else if(cItem.Param2 === 'CALLinbound'){
                                        summary.TalkTimeInbound = summary.TalkTimeInbound + cItem.TotalTime;
                                        summary.TotalAnswered = summary.TotalAnswered + cItem.TotalCount;
                                        summary.TotalCallsInbound = summary.TotalCallsInbound + cItem.TotalCount;
                                    }

                                });
                            }

                            summary.TalkTimeOutbound = (summary.TalkTimeOutbound > summary.TotalHoldTimeOutbound)?summary.TalkTimeOutbound - summary.TotalHoldTimeOutbound: 0;
                            summary.TalkTimeInbound = (summary.TalkTimeInbound > summary.TotalHoldTimeInbound)?summary.TalkTimeInbound - summary.TotalHoldTimeInbound: 0;

                            if (rBreak) {
                                rBreak.forEach(function (bItem) {
                                    summary.BreakTime = summary.BreakTime + bItem.TotalTime;
                                });

                            }
                            if (agentReject) {
                                agentReject.forEach(function (rItem) {
                                    summary.TotalCallsInbound = summary.TotalCallsInbound + rItem.TotalCount;
                                });

                            }
                            if (afterWork) {
                                afterWork.forEach(function (aItem) {
                                    if(aItem.Param2 === 'AfterWorkCALLoutbound'){
                                        summary.AfterWorkTimeOutbound = summary.AfterWorkTimeOutbound + aItem.TotalTime;
                                    }else if(aItem.Param2 === 'AfterWorkCALLinbound'){
                                        summary.AfterWorkTimeInbound = summary.AfterWorkTimeInbound + aItem.TotalTime;
                                    }
                                });
                            }

                            if (summary.TotalCallsInbound > 0) {
                                summary.AvgHoldTimeInbound = summary.TotalHoldTimeInbound / summary.TotalHoldInbound;
                            } else {
                                summary.AvgHoldTimeInbound = 0;
                            }

                            if (summary.TotalHoldOutbound > 0) {
                                summary.AvgHoldTimeOutbound = summary.TotalHoldTimeOutbound / summary.TotalHoldOutbound;
                            } else {
                                summary.AvgHoldTimeOutbound = 0;
                            }

                            if (summary.TotalCallsInbound > 0) {
                                summary.AverageHandlingTimeInbound = (summary.TalkTimeInbound + summary.AfterWorkTimeInbound + summary.TotalHoldTimeInbound) / summary.TotalCallsInbound;
                                summary.AvgTalkTimeInbound = summary.TalkTimeInbound / summary.TotalCallsInbound;
                            } else {
                                summary.AverageHandlingTimeInbound = 0;
                                summary.AvgTalkTimeInbound = 0;
                            }

                            if (summary.TotalCallsOutbound > 0) {
                                summary.AverageHandlingTimeOutbound = (summary.TalkTimeOutbound + summary.AfterWorkTimeOutbound + summary.TotalHoldTimeOutbound) / summary.TotalCallsOutbound;
                                summary.AvgTalkTimeOutbound = summary.TalkTimeOutbound / summary.TotalCallsOutbound;
                            } else {
                                summary.AverageHandlingTimeOutbound = 0;
                                summary.AvgTalkTimeOutbound = 0;
                            }

                            summary.IdleTimeInbound = summary.InboundTime - (summary.AfterWorkTimeInbound + summary.BreakTime + summary.TalkTimeInbound + summary.TotalHoldTimeInbound);
                            summary.IdleTimeOutbound = summary.OutboundTime - (summary.AfterWorkTimeOutbound + summary.BreakTime + summary.TalkTimeOutbound + summary.TotalHoldTimeOutbound);
                            summary.IdleTimeOffline = summary.StaffTime - (summary.IdleTimeInbound + summary.AfterWorkTimeOutbound + summary.TalkTimeOutbound + summary.TotalHoldTimeOutbound);

                            summary.IdleTimeInbound = (summary.IdleTimeInbound > 0)? summary.IdleTimeInbound: 0;
                            summary.IdleTimeOutbound = (summary.IdleTimeOutbound > 0)? summary.IdleTimeOutbound: 0;
                            summary.IdleTimeOffline = (summary.IdleTimeOffline > 0)? summary.IdleTimeOffline: 0;
                            summaryDate.Summary.push(summary);
                        }
                    }
                }

                jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, DailySummary);

                callback.end(jsonString);
            }
            else {
                logger.error('[DVP-ResResource.GetDailySummaryRecords] - [PGSQL]  - No record found for %s - %s  ', tenant, company);
                jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
                callback.end(jsonString);
            }
        }).error(function (err) {
            logger.error('[DVP-ResResource.GetDailySummaryRecords] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenant, company, err);
            jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            callback.end(jsonString);
        });
};

module.exports.GetDailySummaryRecords = GetDailySummaryRecords;