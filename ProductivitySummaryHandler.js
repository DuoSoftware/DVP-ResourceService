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
        query = "SELECT * FROM agent_productivity_summary WHERE summary_date >= '" + summaryFromDate + "' AND summary_date <= '" + summaryToDate + "' AND bu = '" + bu + "' AND company =" + company + " AND tenant = " + tenant +";";
        if (resourceId) {
            query = "SELECT * FROM agent_productivity_summary WHERE summary_date >= '" + summaryFromDate + "' AND summary_date <= '" + summaryToDate + "' AND bu = '" + bu + "' AND company = " + company + " AND tenant = " + tenant +" AND agent = " + resourceId +";";
        }
    }
    else {
        query = "SELECT * FROM agent_productivity_summary WHERE summary_date >= '" + summaryFromDate + "' AND summary_date <= '" + summaryToDate + "' AND bu = '" + bu + "' AND tenant = " + tenant +";";
        if (resourceId) {
            query = "SELECT * FROM agent_productivity_summary WHERE summary_date >= '" + summaryFromDate + "' AND summary_date <= '" + summaryToDate + "' AND bu = '" + bu + "' AND tenant = " + tenant + " AND agent = " + resourceId +";";
        }
    }

    dbConn.SequelizeConn.query(query, {type: dbConn.SequelizeConn.QueryTypes.SELECT})
        .then(function (records) {
            if (records && records.length) {
                //logger.info('[DVP-ResResource.GetDailySummaryRecords] - [%s] - [PGSQL]  - Data found  - %s-[%s]', tenant, company, JSON.stringify(records));
                var DailySummary = [];

                for (var i = 0; i < records.length; i++) {
                    var summary = {};

                    summary.Date = records[i].summary_date;
                    summary.Company = records[i].company;
                    summary.CompanyName = GetCompanyName(records[i].company);
                    summary.Agent = records[i].agent;
                    summary.LoginTime = records[i].login_time;
                    summary.StaffTime = records[i].login_total_time;
                    summary.InboundTime = records[i].inbound_total_time;
                    summary.OutboundTime = records[i].outbound_total_time;
                    summary.TalkTimeInbound = records[i].inbound_talk_total_time;
                    summary.TalkTimeOutbound = records[i].outbound_talk_total_time;
                    summary.AvgTalkTimeInbound = records[i].avg_inbound_talk_time;
                    summary.AvgTalkTimeOutbound = records[i].avg_outbound_talk_time;
                    summary.TotalAnswered = parseInt(records[i].connected_total_count);
                    summary.TotalAnsweredOutbound = parseInt(records[i].outbound_connected_total_count);
                    summary.TotalAnsweredInbound = parseInt(records[i].inbound_connected_total_count);
                    summary.TotalCallsInbound = records[i].inbound_total_count;
                    summary.TotalCallsOutbound = records[i].outbound_total_count;
                    summary.AverageHandlingTimeInbound = records[i].avg_inbound_handling_time;
                    summary.AverageHandlingTimeOutbound = records[i].avg_outbound_handling_time;
                    summary.BreakTime = records[i].total_break_time;
                    summary.AfterWorkTimeInbound = records[i].inbound_acw_total_time;
                    summary.AfterWorkTimeOutbound = records[i].outbound_acw_total_time;
                    summary.IdleTimeInbound = records[i].idle_time_inbound;
                    summary.IdleTimeOutbound = records[i].idle_time_outbound;
                    summary.IdleTimeOffline = records[i].idle_time_offline;
                    summary.TotalHoldInbound = parseInt(records[i].inbound_hold_total_count);
                    summary.TotalHoldTimeInbound = records[i].inbound_hold_total_time;
                    summary.AvgHoldTimeInbound = records[i].avg_inbound_hold_time;
                    summary.TotalHoldOutbound = parseInt(records[i].outbound_hold_total_count);
                    summary.TotalHoldTimeOutbound = records[i].outbound_hold_total_time;
                    summary.AvgHoldTimeOutbound = records[i].avg_outbound_hold_time;

                    if (i === 0) {
                        //logger.info('[DVP-ResResource.GetDailySummaryRecords] - [PGSQL]  - i === 0 ');
                        summary.totalStaffTime = convertToSeconds(records[i].login_total_time);
                        summary.totalInboundTime = convertToSeconds(records[i].inbound_total_time);
                        summary.totalOutboundTime = convertToSeconds(records[i].outbound_total_time);
                        summary.totalInboundIdleTime = convertToSeconds(records[i].idle_time_inbound);
                        summary.totalOutboundIdleTime = convertToSeconds(records[i].idle_time_outbound);
                        summary.totalOfflineIdleTime = convertToSeconds(records[i].idle_time_offline);
                        summary.totalInboundAfterWorkTime = convertToSeconds(records[i].inbound_acw_total_time);
                        summary.totalOutboundAfterWorkTime = convertToSeconds(records[i].outbound_acw_total_time);
                        summary.totalInboundTalkTime = convertToSeconds(records[i].inbound_talk_total_time);
                        summary.totalOutboundTalkTime = convertToSeconds(records[i].outbound_talk_total_time);
                        summary.totalInboundHoldTime = convertToSeconds(records[i].inbound_hold_total_time);
                        summary.totalOutboundHoldTime = convertToSeconds(records[i].outbound_hold_total_time);
                        summary.totalInboundHoldCount = parseInt(records[i].inbound_hold_total_count);
                        summary.totalOutboundHoldCount = parseInt(records[i].outbound_hold_total_count);
                        summary.totalBreakTime = convertToSeconds(records[i].total_break_time);
                        summary.totalInboundAnswered = parseInt(records[i].inbound_connected_total_count);
                        summary.totalOutboundAnswered = parseInt(records[i].outbound_connected_total_count);
                        summary.totalCallsInb = parseInt(records[i].inbound_total_count);
                        summary.totalCallsOut = parseInt(records[i].outbound_total_count);
                        summary.avgInboundHandlingTime = convertToSeconds(records[i].avg_inbound_handling_time);
                        summary.avgOutboundHandlingTime = convertToSeconds(records[i].avg_outbound_handling_time);
                        summary.avgInboundTalkTime = convertToSeconds(records[i].avg_inbound_talk_time);
                        summary.avgOutboundTalkTime = convertToSeconds(records[i].avg_outbound_talk_time);
                        summary.avgInboundHoldTime = convertToSeconds(records[i].avg_inbound_hold_time);
                        summary.avgOutboundHoldTime = convertToSeconds(records[i].avg_outbound_hold_time);
                    }
                    if (i > 0) {
                        summary.totalStaffTime = DailySummary[i-1].totalStaffTime + convertToSeconds(records[i].login_total_time);
                        summary.totalInboundTime = DailySummary[i-1].totalInboundTime + convertToSeconds(records[i].inbound_total_time);
                        summary.totalOutboundTime = DailySummary[i-1].totalOutboundTime + convertToSeconds(records[i].outbound_total_time);
                        summary.totalInboundIdleTime = DailySummary[i-1].totalInboundIdleTime + convertToSeconds(records[i].idle_time_inbound);
                        summary.totalOutboundIdleTime = DailySummary[i-1].totalOutboundIdleTime + convertToSeconds(records[i].idle_time_outbound);
                        summary.totalOfflineIdleTime = DailySummary[i-1].totalOfflineIdleTime + convertToSeconds(records[i].idle_time_offline);
                        summary.totalInboundAfterWorkTime = DailySummary[i-1].totalInboundAfterWorkTime + convertToSeconds(records[i].inbound_acw_total_time);
                        summary.totalOutboundAfterWorkTime = DailySummary[i-1].totalOutboundAfterWorkTime + convertToSeconds(records[i].outbound_acw_total_time);
                        summary.totalInboundTalkTime = DailySummary[i-1].totalInboundTalkTime + convertToSeconds(records[i].inbound_talk_total_time);
                        summary.totalOutboundTalkTime = DailySummary[i-1].totalOutboundTalkTime + convertToSeconds(records[i].outbound_talk_total_time);
                        summary.totalInboundHoldTime = DailySummary[i-1].totalInboundHoldTime + convertToSeconds(records[i].inbound_hold_total_time);
                        summary.totalOutboundHoldTime = DailySummary[i-1].totalOutboundHoldTime + convertToSeconds(records[i].outbound_hold_total_time);
                        summary.totalInboundHoldCount = DailySummary[i-1].totalInboundHoldCount + parseInt(records[i].inbound_hold_total_count);
                        summary.totalOutboundHoldCount = DailySummary[i-1].totalOutboundHoldCount + parseInt(records[i].outbound_hold_total_count);
                        summary.totalBreakTime = DailySummary[i-1].totalBreakTime + convertToSeconds(records[i].total_break_time);
                        summary.totalInboundAnswered = DailySummary[i-1].totalInboundAnswered + parseInt(records[i].inbound_connected_total_count);
                        summary.totalOutboundAnswered = DailySummary[i-1].totalOutboundAnswered + parseInt(records[i].outbound_connected_total_count);
                        summary.totalCallsInb = DailySummary[i-1].totalCallsInb + parseInt(records[i].inbound_total_count);
                        summary.totalCallsOut = DailySummary[i-1].totalCallsOut + parseInt(records[i].outbound_total_count);
                        summary.avgInboundHandlingTime = DailySummary[i-1].avgInboundHandlingTime + convertToSeconds(records[i].avg_inbound_handling_time);
                        summary.avgOutboundHandlingTime = DailySummary[i-1].avgOutboundHandlingTime + convertToSeconds(records[i].avg_outbound_handling_time);
                        summary.avgInboundTalkTime = DailySummary[i-1].avgInboundTalkTime + convertToSeconds(records[i].avg_inbound_talk_time);
                        summary.avgOutboundTalkTime = DailySummary[i-1].avgOutboundTalkTime + convertToSeconds(records[i].avg_outbound_talk_time);
                        summary.avgInboundHoldTime = DailySummary[i-1].avgInboundHoldTime + convertToSeconds(records[i].avg_inbound_hold_time);
                        summary.avgOutboundHoldTime = DailySummary[i-1].avgOutboundHoldTime + convertToSeconds(records[i].avg_outbound_hold_time);
                        //logger.info('[DVP-ResResource.GetDailySummaryRecords] - [PGSQL] - i > 0 - staffTime - [%s] ', summary.totalStaffTime);
                    }

                    DailySummary.push(summary);
                }

                var lastRec = DailySummary.length - 1;

                    DailySummary[lastRec].totalStaffTime = convertToHHMMSS(DailySummary[lastRec].totalStaffTime);
                    DailySummary[lastRec].totalInboundTime = convertToHHMMSS(DailySummary[lastRec].totalInboundTime);
                    DailySummary[lastRec].totalOutboundTime = convertToHHMMSS(DailySummary[lastRec].totalOutboundTime);
                    DailySummary[lastRec].totalInboundIdleTime = convertToHHMMSS(DailySummary[lastRec].totalInboundIdleTime);
                    DailySummary[lastRec].totalOutboundIdleTime = convertToHHMMSS(DailySummary[lastRec].totalOutboundIdleTime);
                    DailySummary[lastRec].totalOfflineIdleTime = convertToHHMMSS(DailySummary[lastRec].totalOfflineIdleTime);
                    DailySummary[lastRec].totalInboundAfterWorkTime = convertToHHMMSS(DailySummary[lastRec].totalInboundAfterWorkTime);
                    DailySummary[lastRec].totalOutboundAfterWorkTime = convertToHHMMSS(DailySummary[lastRec].totalOutboundAfterWorkTime);
                    DailySummary[lastRec].totalInboundTalkTime = convertToHHMMSS(DailySummary[lastRec].totalInboundTalkTime);
                    DailySummary[lastRec].totalOutboundTalkTime = convertToHHMMSS(DailySummary[lastRec].totalOutboundTalkTime);
                    DailySummary[lastRec].totalInboundHoldTime = convertToHHMMSS(DailySummary[lastRec].totalInboundHoldTime);
                    DailySummary[lastRec].totalOutboundHoldTime = convertToHHMMSS(DailySummary[lastRec].totalOutboundHoldTime);
                    DailySummary[lastRec].totalBreakTime = convertToHHMMSS(DailySummary[lastRec].totalBreakTime);
                    DailySummary[lastRec].totalCallsInb = convertToHHMMSS(DailySummary[lastRec].totalCallsInb);
                    DailySummary[lastRec].totalCallsOut = convertToHHMMSS(DailySummary[lastRec].totalCallsOut);
                    DailySummary[lastRec].avgInboundHandlingTime = convertToHHMMSS(DailySummary[lastRec].avgInboundHandlingTime);
                    DailySummary[lastRec].avgOutboundHandlingTime = convertToHHMMSS(DailySummary[lastRec].avgOutboundHandlingTime);
                    DailySummary[lastRec].avgInboundTalkTime = convertToHHMMSS(DailySummary[lastRec].avgInboundTalkTime);
                    DailySummary[lastRec].avgOutboundTalkTime = convertToHHMMSS(DailySummary[lastRec].avgOutboundTalkTime);
                    DailySummary[lastRec].avgInboundHoldTime = convertToHHMMSS(DailySummary[lastRec].avgInboundHoldTime);
                    DailySummary[lastRec].avgOutboundHoldTime = convertToHHMMSS(DailySummary[lastRec].avgOutboundHoldTime);
                    logger.info('[DVP-ResResource.GetDailySummaryRecords] - [PGSQL]  - LAST Record - total inbound Answered - [%s]', DailySummary[lastRec].totalStaffTime);

                logger.info('[DVP-ResResource.GetDailySummaryRecords] - [%s] - [PGSQL]  - First Record  - %s-[%s]', tenant, company, JSON.stringify(DailySummary[0]));
                logger.info('[DVP-ResResource.GetDailySummaryRecords] - [%s] - [PGSQL]  - Last Record  - %s-[%s]', tenant, company, JSON.stringify(DailySummary[lastRec]));
                jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, DailySummary);

                callback.end(jsonString);

            }
            else {
                logger.error('[DVP-ResResource.GetDailySummaryRecords] - [PGSQL]  - No record found for %s - %s  ', tenant, company);
                jsonString = messageFormatter.FormatMessage(null, "No records found for the selected filters", true, undefined);
                callback.end(jsonString);
            }
        }).error(function (err) {
        logger.error('[DVP-ResResource.GetDailySummaryRecords] - [%s] - [%s] - [PGSQL]  - Error in searching.-[%s]', tenant, company, err);
        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        callback.end(jsonString);
    });
};

var convertToHHMMSS = function (sec) {
    var hours = Math.floor(sec / 3600);

    var seconds = sec - hours * 3600;

    var minutes = Math.floor(seconds / 60);

    seconds = seconds - minutes * 60;

    if (hours < 10) {
        hours = '0' + hours.toString();
    }

    if (minutes < 10) {
        minutes = '0' + minutes.toString();
    }

    if (seconds < 10) {
        seconds = '0' + seconds.toString();
    }

    return hours + ':' + minutes + ':' + seconds;
};

var convertToSeconds  = function (time) {
    time = time.trim();

    var timeArr =time.split(":");
    //logger.info('[DVP-ResResource.convertToSeconds] - [PGSQL]  - Return value - [%s]', parseInt(timeArr[0])*3600 + parseInt(timeArr[1])*60 + parseInt(timeArr[2]));
    return parseInt(timeArr[0])*3600 + parseInt(timeArr[1])*60 + parseInt(timeArr[2]);
};

module.exports.GetCompanyName = GetCompanyName;
module.exports.GetDailySummaryRecords = GetDailySummaryRecords;
module.exports.GetDailySummaryRecordsCon = GetDailySummaryRecordsCon;
module.exports.GetFirstLoginForTheDate = GetFirstLoginForTheDate;
