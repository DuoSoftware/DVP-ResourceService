/**
 * Created by Heshan.i on 6/14/2016.
 */
var dbConn = require('dvp-dbmodels');
var messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common-lite/LogHandler/CommonLogHandler.js').logger;
var Q = require('q');
var async = require('async');
var org = require('dvp-mongomodels/model/Organisation');

function FilterObjFromArray(itemArray, field, value) {
    var resultObj;
    for (var i in itemArray) {
        var item = itemArray[i];
        if (item[field] == value) {
            resultObj = item;
            break;
        }
    }
    return resultObj;
}

function FilterAllObjsFromArray(itemArray) {
    var filterObj = {
        loginRecords: [],
        inboundRecords: [],
        outboundRecords: [],
        connected: [],
        rBreak: [],
        agentReject: [],
        afterWork: [],
        holdRecords: [],
        outboundAnswered: []
    };

    if (itemArray && itemArray.length > 0) {
        itemArray.forEach(function (record) {
            switch (record.WindowName) {
                case 'LOGIN':
                    filterObj.loginRecords.push(record);
                    break;
                case 'INBOUND':
                    filterObj.inboundRecords.push(record);
                    break;
                case 'OUTBOUND':
                    filterObj.outboundRecords.push(record);
                    break;
                case 'CONNECTED':
                    filterObj.connected.push(record);
                    break;
                case 'CALLANSWERED':
                    filterObj.outboundAnswered.push(record);
                    break;
                case 'BREAK':
                    filterObj.rBreak.push(record);
                    break;
                case 'AGENTREJECT':
                    filterObj.agentReject.push(record);
                    break;
                case 'AFTERWORK':
                    filterObj.afterWork.push(record);
                    break;
                case 'AGENTHOLD':
                    filterObj.holdRecords.push(record);
                    break;
                default :
                    break;
            }
        });
    }


    //var filterData = itemArray.filter(function (item) {
    //    if(item[field] === value){
    //        return item;
    //    }
    //});
    //
    return filterObj;
}

var GetFirstLoginForTheDate = function (resourceId, summaryFromDate, summaryToDate) {
    var deferred = Q.defer();

    try {

        var loginSessionQuery = {
            where: [{
                ResourceId: resourceId,
                Reason: 'Register',
                createdAt: {between: [summaryFromDate, summaryToDate]}
            }],
            order: [['createdAt', 'ASC']],
            limit: 1
        };
        /*var loginSessionQuery = {
            where: [{
                ResourceId: {$in: ["49", "123"]},
                Reason: 'Register',
                createdAt: {between: [summaryFromDate, summaryToDate]}
            }],
            order: [['createdAt', 'ASC']],
            limit: 1
        };*/

        dbConn.ResResourceStatusChangeInfo.find(loginSessionQuery).then(function (loginRecord) {

            if (loginRecord) {
                deferred.resolve(loginRecord);
            } else {
                var lastLoginSessionQuery = {
                    where: [{ResourceId: resourceId, Reason: 'Register', createdAt: {lt: summaryFromDate}}],
                    order: [['createdAt', 'DESC']],
                    limit: 1
                };

                dbConn.ResResourceStatusChangeInfo.find(lastLoginSessionQuery).then(function (lastLoginRecord) {

                    if (lastLoginRecord) {
                        deferred.resolve(lastLoginRecord);
                    } else {
                        deferred.resolve(undefined);
                    }

                }).catch(function (err) {
                    logger.error('[DVP-ResResource.GetDailySummaryRecords.getFirstLoginForTheDate] - [PGSQL]  - Error  -[%s]', err);
                    deferred.resolve(undefined);
                });
            }

        }).catch(function (err) {
            logger.error('[DVP-ResResource.GetDailySummaryRecords.getFirstLoginForTheDate] - [PGSQL]  - Error  -[%s]', err);
            deferred.resolve(undefined);
        });

    } catch (ex) {
        logger.error('[DVP-ResResource.GetDailySummaryRecords.getFirstLoginForTheDate] - [PGSQL]  - Error  -[%s]', ex);
        deferred.resolve(undefined);
    }

    return deferred.promise;
};

/*var GetDailySummaryRecords = function (tenant, company, summaryFromDate, summaryToDate, resourceId, callback) {
    var jsonString;
    var query = "";

    if (company) {
        query = "SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '" + company + "' and \"Tenant\" = '" + tenant + "' and \"Param1\" = '" + resourceId + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" in ('LOGIN','CONNECTED','AFTERWORK','BREAK','INBOUND','CALLANSWERED','OUTBOUND','AGENTHOLD') union SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '" + company + "' and \"Tenant\" = '" + tenant + "' and \"Param1\" = '" + resourceId + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" = 'AGENTREJECT' ORDER BY \"SummaryDate\" DESC";
        if (resourceId) {
            query = "SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '" + company + "' and \"Tenant\" = '" + tenant + "' and \"Param1\" = '" + resourceId + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" in ('LOGIN','CONNECTED','AFTERWORK','BREAK','INBOUND','CALLANSWERED','OUTBOUND','AGENTHOLD') union SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '" + company + "' and \"Tenant\" = '" + tenant + "' and \"Param1\" = '" + resourceId + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" = 'AGENTREJECT' ORDER BY \"SummaryDate\" DESC";
        }
    }
    else {
        query = "SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Tenant\" = '" + tenant + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" in ('LOGIN','CONNECTED','AFTERWORK','BREAK','INBOUND','CALLANSWERED','OUTBOUND','AGENTHOLD') union SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '" + company + "' and \"Tenant\" = '" + tenant + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" = 'AGENTREJECT' ORDER BY \"SummaryDate\" DESC";
        if (resourceId) {
            query = "SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Tenant\" = '" + tenant + "' and \"Param1\" = '" + resourceId + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" in ('LOGIN','CONNECTED','AFTERWORK','BREAK','INBOUND','CALLANSWERED','OUTBOUND','AGENTHOLD') union SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '" + company + "' and \"Tenant\" = '" + tenant + "' and \"Param1\" = '" + resourceId + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" = 'AGENTREJECT' ORDER BY \"SummaryDate\" DESC";
        }
    }

    dbConn.SequelizeConn.query(query, {type: dbConn.SequelizeConn.QueryTypes.SELECT})
        .then(function (records) {
            if (records) {
                logger.info('[DVP-ResResource.GetDailySummaryRecords] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenant, company, JSON.stringify(records));
                var loginSessions = [];

                records.forEach(function (record) {
                    var loginDateInfo = FilterObjFromArray(loginSessions, "loginDate", record.SummaryDate.toDateString());
                    if (!loginDateInfo) {
                        loginDateInfo = {loginDate: record.SummaryDate.toDateString(), sessionInfos: []};
                        loginSessions.push(loginDateInfo);
                    }

                    if (record.WindowName == "AGENTREJECT") {
                        var rSession = FilterObjFromArray(loginDateInfo.sessionInfos, "resourceId", record.Param2);
                        if (rSession) {
                            rSession.records.push(record);
                        } else {
                            loginDateInfo.sessionInfos.push({resourceId: record.Param2, records: [record]});
                        }
                    } else {
                        var session = FilterObjFromArray(loginDateInfo.sessionInfos, "resourceId", record.Param1);
                        if (session) {
                            session.records.push(record);
                        } else {
                            loginDateInfo.sessionInfos.push({resourceId: record.Param1, records: [record]});
                        }
                    }
                });
                //for(var i in records){
                //    var record = records[i];
                //
                //}

                var DailySummary = [];

                var summaryFuncArray = [];


                loginSessions.forEach(function (dateInfo) {

                    dateInfo.sessionInfos.forEach(function (loginSession) {

                        summaryFuncArray.push(function (callback) {

                            var filterObj = FilterAllObjsFromArray(loginSession.records);

                            var loginRecords = filterObj.loginRecords;
                            var inboundRecords = filterObj.inboundRecords;
                            var outboundRecords = filterObj.outboundRecords;
                            var connected = filterObj.connected;
                            var rBreak = filterObj.rBreak;
                            var agentReject = filterObj.agentReject;
                            var afterWork = filterObj.afterWork;
                            var holdRecords = filterObj.holdRecords;
                            var outboundAnsRecords = filterObj.outboundAnswered;

                            //var loginRecords = FilterAllObjsFromArray(loginSession.records, "WindowName", "LOGIN");
                            //var inboundRecords = FilterAllObjsFromArray(loginSession.records, "WindowName", "INBOUND");
                            //var outboundRecords = FilterAllObjsFromArray(loginSession.records, "WindowName", "OUTBOUND");
                            //var connected = FilterAllObjsFromArray(loginSession.records, "WindowName", "CONNECTED");
                            //var rBreak = FilterAllObjsFromArray(loginSession.records, "WindowName", "BREAK");
                            //var agentReject = FilterAllObjsFromArray(loginSession.records, "WindowName", "AGENTREJECT");
                            //var afterWork = FilterAllObjsFromArray(loginSession.records, "WindowName", "AFTERWORK");
                            //var holdRecords = FilterAllObjsFromArray(loginSession.records, "WindowName", "AGENTHOLD");

                            var login = {};

                            if (loginRecords && loginRecords.length > 0) {
                                login.SummaryDate = loginRecords[0].SummaryDate;
                                login.Company = loginRecords[0].Company;
                                login.Param1 = loginRecords[0].Param1;
                                login.TotalTime = 0;
                                login.InboundTime = 0;
                                login.OutboundTime = 0;

                                loginRecords.forEach(function (loginR) {
                                    if (loginR && loginR.TotalTime > 0) {
                                        login.TotalTime = login.TotalTime + loginR.TotalTime;
                                    }
                                });

                                inboundRecords.forEach(function (inboundR) {
                                    if (inboundR && inboundR.TotalTime > 0) {
                                        login.InboundTime = login.InboundTime + inboundR.TotalTime;
                                    }
                                });

                                outboundRecords.forEach(function (outboundR) {
                                    if (outboundR && outboundR.TotalTime > 0) {
                                        login.OutboundTime = login.OutboundTime + outboundR.TotalTime;
                                    }
                                });


                                GetFirstLoginForTheDate(login.Param1, summaryFromDate, summaryToDate).then(function (firstLoginRecord) {

                                    var summary = {};


                                    summary.Date = login.SummaryDate;
                                    summary.Company = login.Company ;
                                    summary.Agent = login.Param1;
                                    summary.LoginTime = firstLoginRecord ? firstLoginRecord.createdAt : undefined;
                                    summary.StaffTime = login.TotalTime;
                                    summary.InboundTime = login.InboundTime;
                                    summary.OutboundTime = login.OutboundTime;
                                    summary.TalkTimeInbound = 0;
                                    summary.TalkTimeOutbound = 0;
                                    summary.AvgTalkTimeInbound = 0;
                                    summary.AvgTalkTimeOutbound = 0;
                                    summary.TotalAnswered = 0;
                                    summary.TotalAnsweredOutbound = 0;
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
                                            if (hItem.Param2 === 'outbound') {
                                                summary.TotalHoldOutbound = summary.TotalHoldOutbound + hItem.TotalCount;
                                                summary.TotalHoldTimeOutbound = summary.TotalHoldTimeOutbound + hItem.TotalTime;
                                            } else if (hItem.Param2 === 'inbound') {
                                                summary.TotalHoldInbound = summary.TotalHoldInbound + hItem.TotalCount;
                                                summary.TotalHoldTimeInbound = summary.TotalHoldTimeInbound + hItem.TotalTime;
                                            }
                                        });
                                    }

                                    if (outboundAnsRecords && outboundAnsRecords.length > 0) {

                                        outboundAnsRecords.forEach(function (outAnsItem) {

                                            if (outAnsItem.Param2 === 'outbound') {
                                                summary.TotalAnsweredOutbound = summary.TotalAnsweredOutbound + outAnsItem.TotalCount;
                                            }

                                        });
                                    }

                                    if (connected && connected.length > 0) {

                                        connected.forEach(function (cItem) {

                                            if (cItem.Param2 === 'CALLoutbound') {
                                                summary.TalkTimeOutbound = summary.TalkTimeOutbound + cItem.TotalTime;
                                                summary.TotalCallsOutbound = summary.TotalCallsOutbound + cItem.TotalCount;
                                            } else if (cItem.Param2 === 'CALLinbound') {
                                                summary.TalkTimeInbound = summary.TalkTimeInbound + cItem.TotalTime;
                                                summary.TotalAnswered = summary.TotalAnswered + cItem.TotalCount;
                                                summary.TotalCallsInbound = summary.TotalCallsInbound + cItem.TotalCount;
                                            }

                                        });
                                    }

                                    summary.TalkTimeOutbound = (summary.TalkTimeOutbound > summary.TotalHoldTimeOutbound) ? summary.TalkTimeOutbound - summary.TotalHoldTimeOutbound : summary.TotalHoldTimeOutbound;
                                    summary.TalkTimeInbound = (summary.TalkTimeInbound > summary.TotalHoldTimeInbound) ? summary.TalkTimeInbound - summary.TotalHoldTimeInbound : summary.TotalHoldTimeInbound;

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
                                            if (aItem.Param2 === 'AfterWorkCALLoutbound') {
                                                summary.AfterWorkTimeOutbound = summary.AfterWorkTimeOutbound + aItem.TotalTime;
                                            } else if (aItem.Param2 === 'AfterWorkCALLinbound') {
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
                                    summary.IdleTimeOffline = summary.StaffTime - (summary.IdleTimeInbound + summary.IdleTimeOutbound - summary.BreakTime);

                                    summary.IdleTimeInbound = (summary.IdleTimeInbound > 0) ? summary.IdleTimeInbound : 0;
                                    summary.IdleTimeOutbound = (summary.IdleTimeOutbound > 0) ? summary.IdleTimeOutbound : 0;
                                    summary.IdleTimeOffline = (summary.IdleTimeOffline > 0) ? summary.IdleTimeOffline : 0;


                                    callback(undefined, summary);

                                }).catch(function (err) {
                                    callback(undefined, undefined);

                                });
                            } else {
                                callback(undefined, undefined);
                            }

                        });

                    });

                });

                if (summaryFuncArray && summaryFuncArray.length > 0) {

                    async.parallelLimit(summaryFuncArray, 10, function (err, results) {
                        if (results) {
                            results.forEach(function (summary) {

                                if (summary) {
                                    var summaryDate = FilterObjFromArray(DailySummary, "Date", summary.Date.toDateString());
                                    if (!summaryDate) {
                                        summaryDate = {Date: summary.Date.toDateString(), Summary: []};
                                        DailySummary.push(summaryDate);
                                    }

                                    summaryDate.Summary.push(summary);
                                }

                            });
                        }

                        jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, DailySummary);

                        callback.end(jsonString);

                    });
                } else {
                    jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, []);

                    callback.end(jsonString);
                }


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
};*/

var companyInformation = [];
var GetCompanyName = function (companyId) {

    var found = companyInformation.find(function (element) {
        return element.id.toString() === companyId;
    });
    if (found) {
        return found.CompanyName;
    }
    else {

        org.find({tenant:1}).select("-_id companyName tenant id")
            .exec(function (err, report) {
                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "Fail to find reportQueryFilter", false, null);
                    console.log(jsonString);
                } else {
                    if(report){
                        companyInformation = report.map(function (item) {
                            return{
                                CompanyName : item.companyName,
                                id:item.id
                            }
                        })
                    }
                }
            });
        return "N/A";
    }

};


    //
    // var dashboardQuery = {
    //
    //     where: [
    //         {
    //             SummaryDate: {between: [summaryFromDate, summaryToDate]},
    //             TenantId: tenant,
    //             WindowName: ['LOGIN','CONNECTED','AFTERWORK','BREAK','INBOUND','CALLANSWERED','OUTBOUND','AGENTHOLD']
    //
    //         }]
    //
    //     ]
    // };
    //
    // if(company){
    //     CompanyId: company
    // }
    //
    // if(resourceId&& resourceId != "undefined"){
    //
    //     dashboardQuery.where[0].ResourceId = resourceId;
    // }
    //
    //
    //
    //
    // dbConn.DashboardDailySummary.findAll(dashboardQuery).then(function (acwInfo) {
    //


var GetDailySummaryRecordsCon = function (tenant, company, summaryFromDate, summaryToDate, resourceId, bu, callback) {
    var jsonString;
    var query = "";
    //BusinessUnit

    if (company) {
        query = "SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '" + company + "' and \"Tenant\" = '" + tenant + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" in ('LOGIN','CONNECTED','AFTERWORK','BREAK','INBOUND','CALLANSWERED','OUTBOUND','AGENTHOLD') union SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '" + company + "' and \"Tenant\" = '" + tenant + "' and \"Param1\" = '" + resourceId + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" = 'AGENTREJECT' ORDER BY \"SummaryDate\" DESC";
        if (resourceId) {
            query = "SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '" + company + "' and \"Tenant\" = '" + tenant + "' and \"Param1\" = '" + resourceId + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" in ('LOGIN','CONNECTED','AFTERWORK','BREAK','INBOUND','CALLANSWERED','OUTBOUND','AGENTHOLD') union SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Company\" = '" + company + "' and \"Tenant\" = '" + tenant + "' and \"Param1\" = '" + resourceId + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" = 'AGENTREJECT' ORDER BY \"SummaryDate\" DESC";
        }
    }
    else {
        query = "SELECT * FROM \"Dashboard_DailySummaries\" WHERE  \"Tenant\" = '" + tenant + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" in ('LOGIN','CONNECTED','AFTERWORK','BREAK','INBOUND','CALLANSWERED','OUTBOUND','AGENTHOLD') union SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Tenant\" = '" + tenant + "' and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" = 'AGENTREJECT' ORDER BY \"SummaryDate\" DESC";
        if (resourceId) {
            query = "SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Tenant\" = '" + tenant + "' and \"Param1\"  in (" + resourceId + ") and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" in ('LOGIN','CONNECTED','AFTERWORK','BREAK','INBOUND','CALLANSWERED','OUTBOUND','AGENTHOLD') union SELECT * FROM \"Dashboard_DailySummaries\" WHERE \"Tenant\" = '" + tenant + "' and \"Param1\"  in (" + resourceId + ") and \"SummaryDate\" between '" + summaryFromDate + "' and '" + summaryToDate + "' and \"WindowName\" = 'AGENTREJECT' ORDER BY \"SummaryDate\" DESC";
        }
    }

    dbConn.SequelizeConn.query(query, {type: dbConn.SequelizeConn.QueryTypes.SELECT})
        .then(function (records) {
            if (records) {
                logger.info('[DVP-ResResource.GetDailySummaryRecords] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenant, company, JSON.stringify(records));
                var loginSessions = [];

                records.forEach(function (record) {
                    var loginDateInfo = FilterObjFromArray(loginSessions, "loginDate", record.SummaryDate.toDateString());
                    if (!loginDateInfo) {
                        loginDateInfo = {loginDate: record.SummaryDate.toDateString(), sessionInfos: []};
                        loginSessions.push(loginDateInfo);
                    }

                    if (record.WindowName == "AGENTREJECT") {
                        var rSession = FilterObjFromArray(loginDateInfo.sessionInfos, "resourceId", record.Param2);
                        if (rSession) {
                            rSession.records.push(record);
                        } else {
                            loginDateInfo.sessionInfos.push({resourceId: record.Param2, records: [record]});
                        }
                    } else {
                        var session = FilterObjFromArray(loginDateInfo.sessionInfos, "resourceId", record.Param1);
                        if (session) {
                            session.records.push(record);
                        } else {
                            loginDateInfo.sessionInfos.push({resourceId: record.Param1, records: [record]});
                        }
                    }
                });
                //for(var i in records){
                //    var record = records[i];
                //
                //}

                var DailySummary = [];

                var summaryFuncArray = [];


                loginSessions.forEach(function (dateInfo) {

                    dateInfo.sessionInfos.forEach(function (loginSession) {

                        summaryFuncArray.push(function (callback) {

                            var filterObj = FilterAllObjsFromArray(loginSession.records);

                            var loginRecords = filterObj.loginRecords;
                            var inboundRecords = filterObj.inboundRecords;
                            var outboundRecords = filterObj.outboundRecords;
                            var connected = filterObj.connected;
                            var rBreak = filterObj.rBreak;
                            var agentReject = filterObj.agentReject;
                            var afterWork = filterObj.afterWork;
                            var holdRecords = filterObj.holdRecords;
                            var outboundAnsRecords = filterObj.outboundAnswered;

                            //var loginRecords = FilterAllObjsFromArray(loginSession.records, "WindowName", "LOGIN");
                            //var inboundRecords = FilterAllObjsFromArray(loginSession.records, "WindowName", "INBOUND");
                            //var outboundRecords = FilterAllObjsFromArray(loginSession.records, "WindowName", "OUTBOUND");
                            //var connected = FilterAllObjsFromArray(loginSession.records, "WindowName", "CONNECTED");
                            //var rBreak = FilterAllObjsFromArray(loginSession.records, "WindowName", "BREAK");
                            //var agentReject = FilterAllObjsFromArray(loginSession.records, "WindowName", "AGENTREJECT");
                            //var afterWork = FilterAllObjsFromArray(loginSession.records, "WindowName", "AFTERWORK");
                            //var holdRecords = FilterAllObjsFromArray(loginSession.records, "WindowName", "AGENTHOLD");

                            var login = {};

                            if (loginRecords && loginRecords.length > 0) {
                                login.SummaryDate = loginRecords[0].SummaryDate;
                                login.Company = loginRecords[0].Company;
                                login.Param1 = loginRecords[0].Param1;
                                login.TotalTime = 0;
                                login.InboundTime = 0;
                                login.OutboundTime = 0;

                                loginRecords.forEach(function (loginR) {
                                    if (loginR && loginR.TotalTime > 0) {
                                        login.TotalTime = login.TotalTime + loginR.TotalTime;
                                    }
                                });

                                inboundRecords.forEach(function (inboundR) {
                                    if (inboundR && inboundR.TotalTime > 0) {
                                        login.InboundTime = login.InboundTime + inboundR.TotalTime;
                                    }
                                });

                                outboundRecords.forEach(function (outboundR) {
                                    if (outboundR && outboundR.TotalTime > 0) {
                                        login.OutboundTime = login.OutboundTime + outboundR.TotalTime;
                                    }
                                });


                                GetFirstLoginForTheDate(login.Param1, summaryFromDate, summaryToDate).then(function (firstLoginRecord) {

                                    var summary = {};

                                    summary.Date = login.SummaryDate;
                                    summary.Company = login.Company;
                                    summary.CompanyName = GetCompanyName(summary.Company);
                                    summary.Agent = login.Param1;
                                    summary.LoginTime = firstLoginRecord ? firstLoginRecord.createdAt : undefined;
                                    summary.StaffTime = login.TotalTime;
                                    summary.InboundTime = login.InboundTime;
                                    summary.OutboundTime = login.OutboundTime;
                                    summary.TalkTimeInbound = 0;
                                    summary.TalkTimeOutbound = 0;
                                    summary.AvgTalkTimeInbound = 0;
                                    summary.AvgTalkTimeOutbound = 0;
                                    summary.TotalAnswered = 0;
                                    summary.TotalAnsweredOutbound = 0;
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


                                    if(bu && (bu != "default" && bu.toLowerCase() != "all")){

                                        summary[bu] = {};
                                        summary[bu].TalkTimeInbound = 0;
                                        summary[bu].TalkTimeOutbound = 0;
                                        summary[bu].AvgTalkTimeInbound = 0;
                                        summary[bu].AvgTalkTimeOutbound = 0;
                                        summary[bu].TotalAnswered = 0;
                                        summary[bu].TotalAnsweredOutbound = 0;
                                        summary[bu].TotalCallsInbound = 0;
                                        summary[bu].TotalCallsOutbound = 0;
                                        summary[bu].AverageHandlingTimeInbound = 0;
                                        summary[bu].AverageHandlingTimeOutbound = 0;
                                        summary[bu].AfterWorkTimeInbound = 0;
                                        summary[bu].AfterWorkTimeOutbound = 0;
                                        summary[bu].TotalHoldInbound = 0;
                                        summary[bu].TotalHoldTimeInbound = 0;
                                        summary[bu].AvgHoldTimeInbound = 0;
                                        summary[bu].TotalHoldOutbound = 0;
                                        summary[bu].TotalHoldTimeOutbound = 0;
                                        summary[bu].AvgHoldTimeOutbound = 0;


                                    }



                                    if (holdRecords) {
                                        holdRecords.forEach(function (hItem) {
                                            if (hItem.Param2 === 'outbound') {
                                                summary.TotalHoldOutbound = summary.TotalHoldOutbound + hItem.TotalCount;
                                                summary.TotalHoldTimeOutbound = summary.TotalHoldTimeOutbound + hItem.TotalTime;
                                                if(hItem.BusinessUnit == bu ){

                                                    summary[bu].TotalHoldOutbound = summary[bu].TotalHoldOutbound + hItem.TotalCount;
                                                    summary[bu].TotalHoldTimeOutbound = summary[bu].TotalHoldTimeOutbound + hItem.TotalTime;
                                                }
                                            } else if (hItem.Param2 === 'inbound') {
                                                summary.TotalHoldInbound = summary.TotalHoldInbound + hItem.TotalCount;
                                                summary.TotalHoldTimeInbound = summary.TotalHoldTimeInbound + hItem.TotalTime;

                                                if(hItem.BusinessUnit == bu ){

                                                    summary[bu].TotalHoldInbound = summary[bu].TotalHoldInbound + hItem.TotalCount;
                                                    summary[bu].TotalHoldTimeInbound = summary[bu].TotalHoldTimeInbound + hItem.TotalTime;
                                                }
                                            }
                                        });
                                    }

                                    if (outboundAnsRecords && outboundAnsRecords.length > 0) {

                                        outboundAnsRecords.forEach(function (outAnsItem) {

                                            if (outAnsItem.Param2 === 'outbound') {
                                                summary.TotalAnsweredOutbound = summary.TotalAnsweredOutbound + outAnsItem.TotalCount;

                                                if(outAnsItem.BusinessUnit == bu ){

                                                    summary[bu].TotalAnsweredOutbound = summary[bu].TotalAnsweredOutbound + outAnsItem.TotalCount;
                                                }
                                            }

                                        });
                                    }

                                    if (connected && connected.length > 0) {

                                        connected.forEach(function (cItem) {

                                            if (cItem.Param2 === 'CALLoutbound') {
                                                summary.TalkTimeOutbound = summary.TalkTimeOutbound + cItem.TotalTime;
                                                summary.TotalCallsOutbound = summary.TotalCallsOutbound + cItem.TotalCount;

                                                if(cItem.BusinessUnit == bu ){
                                                    summary[bu].TalkTimeOutbound = summary[bu].TalkTimeOutbound + cItem.TotalTime;
                                                    summary[bu].TotalCallsOutbound = summary[bu].TotalCallsOutbound + cItem.TotalCount;
                                                }

                                            } else if (cItem.Param2 === 'CALLinbound') {
                                                summary.TalkTimeInbound = summary.TalkTimeInbound + cItem.TotalTime;
                                                summary.TotalAnswered = summary.TotalAnswered + cItem.TotalCount;
                                                summary.TotalCallsInbound = summary.TotalCallsInbound + cItem.TotalCount;

                                                if(cItem.BusinessUnit == bu ){
                                                    summary[bu].TalkTimeInbound = summary[bu].TalkTimeInbound + cItem.TotalTime;
                                                    summary[bu].TotalAnswered = summary[bu].TotalAnswered + cItem.TotalCount;
                                                    summary[bu].TotalCallsInbound = summary[bu].TotalCallsInbound + cItem.TotalCount;
                                                }
                                            }

                                        });
                                    }

                                    summary.TalkTimeOutbound = (summary.TalkTimeOutbound > summary.TotalHoldTimeOutbound) ?
                                        summary.TalkTimeOutbound - summary.TotalHoldTimeOutbound : summary.TotalHoldTimeOutbound;
                                    summary.TalkTimeInbound = (summary.TalkTimeInbound > summary.TotalHoldTimeInbound) ?
                                        summary.TalkTimeInbound - summary.TotalHoldTimeInbound : summary.TotalHoldTimeInbound;

                                    if(bu && (bu != "default" && bu.toLowerCase() != "all")){

                                        summary[bu].TalkTimeOutbound = (summary[bu].TalkTimeOutbound > summary[bu].TotalHoldTimeOutbound) ?
                                            summary[bu].TalkTimeOutbound - summary[bu].TotalHoldTimeOutbound : summary[bu].TotalHoldTimeOutbound;
                                        summary[bu].TalkTimeInbound = (summary[bu].TalkTimeInbound > summary[bu].TotalHoldTimeInbound) ?
                                            summary[bu].TalkTimeInbound - summary[bu].TotalHoldTimeInbound : summary[bu].TotalHoldTimeInbound;

                                    }


                                    if (rBreak) {
                                        rBreak.forEach(function (bItem) {
                                            summary.BreakTime = summary.BreakTime + bItem.TotalTime;
                                        });

                                    }
                                    if (agentReject) {
                                        agentReject.forEach(function (rItem) {
                                            summary.TotalCallsInbound = summary.TotalCallsInbound + rItem.TotalCount;
                                            if(rItem.BusinessUnit == bu ){
                                                summary[bu].TotalCallsInbound = summary[bu].TotalCallsInbound + rItem.TotalCount;
                                            }


                                        });

                                    }
                                    if (afterWork) {
                                        afterWork.forEach(function (aItem) {
                                            if (aItem.Param2 === 'AfterWorkCALLoutbound') {
                                                summary.AfterWorkTimeOutbound = summary.AfterWorkTimeOutbound + aItem.TotalTime;

                                                if(aItem.BusinessUnit == bu ){
                                                    summary[bu].AfterWorkTimeOutbound = summary[bu].AfterWorkTimeOutbound + aItem.TotalTime;
                                                }

                                            } else if (aItem.Param2 === 'AfterWorkCALLinbound') {
                                                summary.AfterWorkTimeInbound = summary.AfterWorkTimeInbound + aItem.TotalTime;

                                                if(aItem.BusinessUnit == bu ){
                                                    summary[bu].AfterWorkTimeInbound = summary[bu].AfterWorkTimeInbound + aItem.TotalTime;
                                                }
                                            }
                                        });
                                    }

                                    if (summary.TotalHoldInbound > 0 ) {
                                        summary.AvgHoldTimeInbound = summary.TotalHoldTimeInbound / summary.TotalHoldInbound;

                                    } else {
                                        summary.AvgHoldTimeInbound = 0;
                                    }

                                    if (summary.TotalHoldOutbound > 0 ) {
                                        summary.AvgHoldTimeOutbound = summary.TotalHoldTimeOutbound / summary.TotalHoldOutbound;
                                    } else {
                                        summary.AvgHoldTimeOutbound = 0;
                                    }

                                    if (summary.TotalCallsInbound > 0 ) {
                                        summary.AverageHandlingTimeInbound = (summary.TalkTimeInbound + summary.AfterWorkTimeInbound + summary.TotalHoldTimeInbound) / summary.TotalCallsInbound;
                                        summary.AvgTalkTimeInbound = summary.TalkTimeInbound / summary.TotalCallsInbound;
                                    } else {
                                        summary.AverageHandlingTimeInbound = 0;
                                        summary.AvgTalkTimeInbound = 0;
                                    }

                                    if (summary.TotalCallsOutbound > 0 ) {
                                        summary.AverageHandlingTimeOutbound = (summary.TalkTimeOutbound + summary.AfterWorkTimeOutbound + summary.TotalHoldTimeOutbound) / summary.TotalCallsOutbound;
                                        summary.AvgTalkTimeOutbound = summary.TalkTimeOutbound / summary.TotalCallsOutbound;
                                    } else {
                                        summary.AverageHandlingTimeOutbound = 0;
                                        summary.AvgTalkTimeOutbound = 0;
                                    }

                                    summary.IdleTimeInbound = summary.InboundTime - (summary.AfterWorkTimeInbound +  + summary.TalkTimeInbound + summary.TotalHoldTimeInbound);
                                    summary.IdleTimeOutbound = summary.OutboundTime - (summary.AfterWorkTimeOutbound + summary.BreakTime + summary.TalkTimeOutbound + summary.TotalHoldTimeOutbound);
                                    //summary.IdleTimeOffline = summary.StaffTime - (summary.IdleTimeInbound + summary.IdleTimeOutbound - summary.BreakTime);
                                    summary.IdleTimeOffline = summary.StaffTime - (summary.InboundTime + summary.OutboundTime);

                                    summary.IdleTimeInbound = (summary.IdleTimeInbound > 0) ? summary.IdleTimeInbound : 0;
                                    summary.IdleTimeOutbound = (summary.IdleTimeOutbound > 0) ? summary.IdleTimeOutbound : 0;
                                    summary.IdleTimeOffline = (summary.IdleTimeOffline > 0) ? summary.IdleTimeOffline : 0;



                                    if(bu && (bu != "default" && bu.toLowerCase() != "all")){


                                        if (summary[bu].TotalHoldInbound > 0) {
                                            summary[bu].AvgHoldTimeInbound = summary[bu].TotalHoldTimeInbound / summary[bu].TotalHoldInbound;

                                        } else {
                                            summary[bu].AvgHoldTimeInbound = 0;
                                        }

                                        if (summary[bu].TotalHoldOutbound > 0 ) {
                                            summary[bu].AvgHoldTimeOutbound = summary[bu].TotalHoldTimeOutbound / summary[bu].TotalHoldOutbound;
                                        } else {
                                            summary[bu].AvgHoldTimeOutbound = 0;
                                        }

                                        if (summary[bu].TotalCallsInbound > 0 ) {
                                            summary[bu].AverageHandlingTimeInbound = (summary[bu].TalkTimeInbound + summary[bu].AfterWorkTimeInbound +
                                                summary[bu].TotalHoldTimeInbound) / summary[bu].TotalCallsInbound;
                                            summary[bu].AvgTalkTimeInbound = summary[bu].TalkTimeInbound / summary[bu].TotalCallsInbound;
                                        } else {
                                            summary[bu].AverageHandlingTimeInbound = 0;
                                            summary[bu].AvgTalkTimeInbound = 0;
                                        }

                                        if (summary[bu].TotalCallsOutbound > 0 ) {
                                            summary[bu].AverageHandlingTimeOutbound = (summary[bu].TalkTimeOutbound + summary[bu].AfterWorkTimeOutbound + summary[bu].TotalHoldTimeOutbound)
                                                / summary[bu].TotalCallsOutbound;
                                            summary[bu].AvgTalkTimeOutbound = summary[bu].TalkTimeOutbound / summary[bu].TotalCallsOutbound;
                                        } else {
                                            summary[bu].AverageHandlingTimeOutbound = 0;
                                            summary[bu].AvgTalkTimeOutbound = 0;
                                        }

                                        ///////////////////not require in bu wise////////////////////////////////////////////////////////
                                        // summary[bu].IdleTimeInbound = summary[bu].InboundTime - (summary[bu].AfterWorkTimeInbound +
                                        //     summary[bu].BreakTime + summary[bu].TalkTimeInbound + summary[bu].TotalHoldTimeInbound);
                                        // summary[bu].IdleTimeOutbound = summary[bu].OutboundTime - (summary[bu].AfterWorkTimeOutbound +
                                        //     summary[bu].BreakTime + summary[bu].TalkTimeOutbound + summary[bu].TotalHoldTimeOutbound);
                                        // summary[bu].IdleTimeOffline = summary[bu].StaffTime - (summary[bu].InboundTime + summary[bu].OutboundTime);
                                        //
                                        // summary[bu].IdleTimeInbound = (summary[bu].IdleTimeInbound > 0) ? summary[bu].IdleTimeInbound : 0;
                                        // summary[bu].IdleTimeOutbound = (summary[bu].IdleTimeOutbound > 0) ? summary[bu].IdleTimeOutbound : 0;
                                        // summary[bu].IdleTimeOffline = (summary[bu].IdleTimeOffline > 0) ? summary[bu].IdleTimeOffline : 0;



                                    }

                                    callback(undefined, summary);

                                }).catch(function (err) {
                                    callback(undefined, undefined);

                                });
                            } else {
                                callback(undefined, undefined);
                            }

                        });

                    });

                });

                if (summaryFuncArray && summaryFuncArray.length > 0) {

                    async.parallelLimit(summaryFuncArray, 10, function (err, results) {
                        if (results) {
                            results.forEach(function (summary) {

                                if (summary) {
                                    var summaryDate = FilterObjFromArray(DailySummary, "Date", summary.Date.toDateString());
                                    if (!summaryDate) {
                                        summaryDate = {Date: summary.Date.toDateString(), Summary: []};
                                        DailySummary.push(summaryDate);
                                    }

                                    summaryDate.Summary.push(summary);
                                }

                            });
                        }

                        jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, DailySummary);

                        callback.end(jsonString);

                    });
                } else {
                    jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, []);

                    callback.end(jsonString);
                }


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

var GetDailySummaryRecords = function (tenant, company, summaryFromDate, summaryToDate, resourceId, bu, callback) {
    var jsonString;
    var query = "";

    if (company) {
        query = "SELECT * FROM agent_productivity_summary( '" + summaryFromDate + "' , '" + summaryToDate + "' , " + null + " , " + "'+05:30'" + " , '" + bu + "' , " + company + "," + tenant +");";
        if (resourceId) {
            query = "SELECT * FROM agent_productivity_summary( '" + summaryFromDate + "' , '" + summaryToDate + "' , '" + resourceId + "' , " + "'+05:30'" + " , '" + bu + "'," + company + "," + tenant +");";
        }
    }
    else {
        query = "SELECT * FROM agent_productivity_summary( '" + summaryFromDate + "', '" + summaryToDate + "' , '" + null + " , " + "'+05:30'" + " , '" + bu + "'," + null + "," + tenant +");";
        if (resourceId) {
            query = "SELECT * FROM agent_productivity_summary( '" + summaryFromDate + "', '" + summaryToDate + "' , '" + resourceId + "' , " + "'+05:30'" + " , '" + bu + "'," + null + "," + tenant +");";
        }
    }

    dbConn.SequelizeConn.query(query, {type: dbConn.SequelizeConn.QueryTypes.SELECT})
        .then(function (records) {
            if (records) {
                logger.info('[DVP-ResResource.GetDailySummaryRecords] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenant, company, JSON.stringify(records));
                var DailySummary = [];
                records.forEach(function (record) {
                    var summary = {};

                    summary.Date = record.summary_date;
                    summary.Company = record.company;
                    summary.CompanyName = GetCompanyName(record.company);
                    summary.Agent = record.agent;
                    summary.LoginTime = record.login_time;
                    summary.StaffTime = record.login_total_time;
                    summary.InboundTime = record.inbound_total_time;
                    summary.OutboundTime = record.outbound_total_time;
                    summary.TalkTimeInbound = record.inbound_talk_total_time;
                    summary.TalkTimeOutbound = record.outbound_talk_total_time;
                    summary.AvgTalkTimeInbound = record.avg_inbound_talk_time;
                    summary.AvgTalkTimeOutbound = record.avg_outbound_talk_time;
                    summary.TotalAnswered = parseInt(record.connected_total_count);
                    summary.TotalAnsweredOutbound = parseInt(record.outbound_connected_total_count);
                    summary.TotalAnsweredInbound = parseInt(record.inbound_connected_total_count);
                    summary.TotalCallsInbound = record.inbound_total_count;
                    summary.TotalCallsOutbound = record.outbound_total_count;
                    summary.AverageHandlingTimeInbound = record.full_avg_inbound_handling_time;
                    summary.AverageHandlingTimeOutbound = record.full_avg_outbound_handling_time;
                    summary.BreakTime = record.total_break_time;
                    summary.AfterWorkTimeInbound = record.inbound_acw_total_time;
                    summary.AfterWorkTimeOutbound = record.outbound_acw_total_time;
                    summary.IdleTimeInbound = record.idle_time_inbound;
                    summary.IdleTimeOutbound = record.idle_time_outbound;
                    summary.IdleTimeOffline = record.idle_time_offline;
                    summary.TotalHoldInbound = parseInt(record.inbound_hold_total_count);
                    summary.TotalHoldTimeInbound = record.inbound_hold_total_time;
                    summary.AvgHoldTimeInbound = record.avg_inbound_hold_time;
                    summary.TotalHoldOutbound = parseInt(record.outbound_hold_total_count);
                    summary.TotalHoldTimeOutbound = record.outbound_hold_total_time;
                    summary.AvgHoldTimeOutbound = record.avg_outbound_hold_time;

                    summary.totalStaffTime = record.full_total_login_time;
                    summary.totalInboundTime = record.full_total_inbound_time;
                    summary.totalOutboundTime = record.full_total_outbound_time;
                    summary.totalInboundIdleTime = record.full_total_inbound_idle_time;
                    summary.totalOutboundIdleTime = record.full_total_outbound_idle_time;
                    summary.totalOfflineIdleTime = record.full_total_offline_idle_time;
                    summary.totalInboundAfterWorkTime = record.full_total_inbound_acw_time;
                    summary.totalOutboundAfterWorkTime = record.full_total_outbound_acw_time;
                    summary.totalInboundTalkTime = record.full_total_inbound_talk_time;
                    summary.totalOutboundTalkTime = record.full_total_outbound_talk_time;
                    summary.totalInboundHoldTime = record.full_total_inbound_hold_time;
                    summary.totalOutboundHoldTime = record.full_total_outbound_hold_time;
                    summary.totalInboundHoldCount = parseInt(record.full_total_inbound_hold_count);
                    summary.totalOutboundHoldCount = parseInt(record.full_total_outbound_hold_count);
                    summary.totalBreakTime = record.full_total_break_time;
                    summary.totalInboundAnswered = parseInt(record.full_total_connected_inbound_calls);
                    summary.totalOutboundAnswered = parseInt(record.full_total_connected_outbound_calls);
                    summary.totalCallsInb = parseInt(record.full_total_inbound_calls);
                    summary.totalCallsOut = parseInt(record.full_total_outbound_calls);
                    summary.avgInboundHandlingTime = record.full_avg_inbound_handling_time;
                    summary.avgOutboundHandlingTime = record.full_avg_outbound_handling_time;
                    summary.avgInboundTalkTime = record.full_avg_inbound_talk_time;
                    summary.avgOutboundTalkTime = record.full_avg_outbound_talk_time;
                    summary.avgInboundHoldTime = record.full_avg_inbound_hold_time;
                    summary.avgOutboundHoldTime = record.full_avg_outbound_hold_time;

                    DailySummary.push(summary);

                });
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

module.exports.GetCompanyName = GetCompanyName;
module.exports.GetDailySummaryRecords = GetDailySummaryRecords;
module.exports.GetDailySummaryRecordsCon = GetDailySummaryRecordsCon;
module.exports.GetFirstLoginForTheDate = GetFirstLoginForTheDate;
