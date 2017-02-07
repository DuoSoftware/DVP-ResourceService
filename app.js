/**
 * Created by Rajinda on 6/1/2015.
 */

var restify = require('restify');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');

var config = require('config');

var port = config.Host.port || 3000;
var version = config.Host.version;
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var attributeHandler = require('./AttributeHandler');
var groupsHandler = require('./GroupsHandler');
var resourceHandler = require('./ResourceHandler');
var taskHandler = require('./TaskHandler');
var taskInfoHandler = require('./TaskInfoHandler');
var productivityHandler = require('./ProductivityHandler');
var productivitySummaryHandler = require('./ProductivitySummaryHandler');
var sharedResourceHandler = require('./SharedResourceHandler');
var breakTypeHandler = require('./BreakTypeHandler');

//-------------------------  Restify Server ------------------------- \\
var RestServer = restify.createServer({
    name: "ResourceService",
    version: '1.0.0'
}, function (req, res) {

});
restify.CORS.ALLOW_HEADERS.push('api_key');
restify.CORS.ALLOW_HEADERS.push('authorization');

RestServer.use(restify.CORS());
RestServer.use(restify.fullResponse());
//Enable request body parsing(access)
RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());

// ---------------- Security -------------------------- \\
var jwt = require('restify-jwt');
var secret = require('dvp-common/Authentication/Secret.js');
var authorization = require('dvp-common/Authentication/Authorization.js');
RestServer.use(jwt({secret: secret.Secret}));
// ---------------- Security -------------------------- \\

//Server listen
RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);


});

//------------------------- End Restify Server ------------------------- \\

//------------------------- Attribute Handler ------------------------- \\

RestServer.post('/DVP/API/' + version + '/ResourceManager/Attribute', authorization({
    resource: "attribute",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[attributeHandler.CreateAttribute] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;

        var att = req.body;

        attributeHandler.CreateAttribute(att.Attribute, att.AttClass, att.AttType, att.AttCategory, tenantId, companyId, att.OtherData, res);

    }
    catch (ex) {

        logger.error('[attributeHandler.CreateAttribute] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[attributeHandler.CreateAttribute] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/Attribute/:AttributeId', authorization({
    resource: "attribute",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[attributeHandler.EditAttribute] - [HTTP]  - Request received -  Data - %s  - %s', JSON.stringify(req.body), JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        attributeHandler.EditAttribute(req.params.AttributeId, att.Attribute, att.AttClass, att.AttType, att.AttCategory, tenantId, companyId, att.OtherData, res);

    }
    catch (ex) {

        logger.error('[attributeHandler.EditAttribute] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[attributeHandler.EditAttribute] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/Attribute/:AttributeId', authorization({
    resource: "attribute",
    action: "delete"
}), function (req, res, next) {
    try {

        logger.info('[attributeHandler.DeleteAttribute] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var att = req.params;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        attributeHandler.DeleteAttribute(att.AttributeId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[attributeHandler.DeleteAttribute] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[attributeHandler.DeleteAttribute] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Attributes', authorization({
    resource: "attribute",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[attributeHandler.GetAllAttribute] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        attributeHandler.GetAllAttributes(tenantId, companyId, res);
    }
    catch (ex) {

        logger.error('[attributeHandler.GetAllAttribute] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[attributeHandler.GetAllAttribute] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/AttributeCount', authorization({
    resource: "attribute",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[attributeHandler.GetAllAttributeCount] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        attributeHandler.GetAllAttributeCount(tenantId, companyId, res);
    }
    catch (ex) {

        logger.error('[attributeHandler.GetAllAttributeCount] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[attributeHandler.GetAllAttributeCount] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Attributes/:RowCount/:PageNo', authorization({
    resource: "attribute",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[attributeHandler.GetAllAttribute] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));
        var att = req.params;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        attributeHandler.GetAllAttributesPaging(tenantId, companyId, att.RowCount, att.PageNo, res);
    }
    catch (ex) {

        logger.error('[attributeHandler.GetAllAttribute] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[attributeHandler.GetAllAttribute] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Attribute/:AttributeId', authorization({
    resource: "attribute",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[attributeHandler.GetAttributeById] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));
        var att = req.params;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        attributeHandler.GetAttributeById(att.AttributeId, tenantId, companyId, res);
    }
    catch (ex) {

        logger.error('[attributeHandler.GetAttributeById] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[attributeHandler.GetAttributeById] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Attribute/:AttributeId/Details', authorization({
    resource: "attribute",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetGroupDetailsByAttributeId] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.GetGroupDetailsByAttributeId(req.params.AttributeId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetGroupDetailsByAttributeId] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetGroupDetailsByAttributeId] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/AttributeGroup/:GroupId', authorization({
    resource: "attribute",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAttributeByGroupId] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        attributeHandler.GetAttributeByGroupId(req.params.GroupId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetAttributeByGroupId] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetAttributeByGroupId] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

//------------------------- End Attribute Handler ------------------------- \\

//------------------------- Group Handler ------------------------- \\

RestServer.post('/DVP/API/' + version + '/ResourceManager/Group', authorization({
    resource: "group",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.CreateGroups] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.CreateGroups(att.GroupName, att.GroupClass, att.GroupType, att.GroupCategory, tenantId, companyId, att.OtherData, att.Percentage, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.CreateGroups] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.CreateGroups] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/Group/:GroupId', authorization({
    resource: "group",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.EditGroups] - [HTTP]  - Request received -  Data - %s - %s ', JSON.stringify(req.body), JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.EditGroups(req.params.GroupId, att.GroupName, att.GroupClass, att.GroupType, att.GroupCategory, tenantId, companyId, att.OtherData, att.Percentage, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.EditGroups] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.EditGroups] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/Group/:GroupId/Attributes', authorization({
    resource: "group",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.EditGroupAndAttachAttributes] - [HTTP]  - Request received -  Data - %s - %s ', JSON.stringify(req.body), JSON.stringify(req.params));


        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.EditGroupAndAttachAttributes(req, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.EditGroupAndAttachAttributes] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.EditGroupAndAttachAttributes] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/Group/:GroupId', authorization({
    resource: "group",
    action: "delete"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.DeleteGroups] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.DeleteGroups(req.params.GroupId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.DeleteGroups] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.DeleteGroups] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Groups', authorization({
    resource: "group",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAllGroups] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.GetAllGroups(tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetAllGroups] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetAllGroups] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/GroupsCount', authorization({
    resource: "group",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GroupsCount] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.GroupsCount(tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GroupsCount] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GroupsCount] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Groups/:RowCount/:PageNo', authorization({
    resource: "group",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAllGroups] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.GetAllGroupsPaging(tenantId, companyId, req.params.RowCount, req.params.PageNo, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetAllGroups] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetAllGroups] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Group/:GroupId', authorization({
    resource: "group",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAllGroups] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.GetGroupByGroupId(req.params.GroupId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetAllGroups] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetAllGroups] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.post('/DVP/API/' + version + '/ResourceManager/Group/Attribute', authorization({
    resource: "group",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.AddAttributeToGroups] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.AddAttributeToGroups(att.AttributeIds, att.GroupName, att.GroupClass, att.GroupType, att.GroupCategory, tenantId, companyId, att.OtherData, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.AddAttributeToGroups] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.AddAttributeToGroups] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/Group/:GroupId/Attribute', authorization({
    resource: "group",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.AddAttributeToExsistingGroups] - [HTTP]  - Request received -  Data - %s - %s ', JSON.stringify(req.body), JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.AddAttributeToExsistingGroups(att.AttributeIds, req.params.GroupId, tenantId, companyId, att.OtherData, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.AddAttributeToExsistingGroups] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.AddAttributeToExsistingGroups] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/ExsistingGroup/:GroupId/Attribute/:AttributeId', authorization({
    resource: "group",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.AddOneAttributeToExsistingGroups] - [HTTP]  - Request received -  Data - %s - %s ', JSON.stringify(req.body), JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.AddOneAttributeToExsistingGroups(att.AttributeId, req.params.GroupId, tenantId, companyId, att.OtherData, res);
    }
    catch (ex) {

        logger.error('[groupsHandler.AddOneAttributeToExsistingGroups] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.AddOneAttributeToExsistingGroups] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Group/:GroupId/Attribute', authorization({
    resource: "group",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAttributeByGroupId] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.GetAttributeByGroupId(req.params.GroupId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetAttributeByGroupId] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetAttributeByGroupId] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Group/:GroupId/Attribute/Details', authorization({
    resource: "group",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAttributeByGroupId] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.GetAttributeByGroupIdWithDetails(req.params.GroupId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetAttributeByGroupId] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetAttributeByGroupId] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/Group/:GroupId/Attribute/:AttributeId', authorization({
    resource: "group",
    action: "delete"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.DeleteAttributeFromGroup] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.DeleteAttributeFromGroup(req.params.GroupId, req.params.AttributeId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.DeleteAttributeFromGroup] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.DeleteAttributeFromGroup] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/Group/:GroupId/DeleteAttributes', authorization({
    resource: "group",
    action: "delete"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.DeleteAttributesFromGroup] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        groupsHandler.DeleteAttributesFromGroup(req, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.DeleteAttributesFromGroup] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.DeleteAttributesFromGroup] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});
//-------------------------End Group Handler ------------------------- \\

//------------------------- Resource Handler ------------------------- \\

RestServer.post('/DVP/API/' + version + '/ResourceManager/Resource', authorization({
    resource: "ardsresource",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.CreateResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.CreateResource(att.ResClass, att.ResType, att.ResCategory, tenantId, companyId, att.ResourceName, att.OtherData,req.user.iss, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.CreateResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.CreateResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/Resource/:ResourceId', authorization({
    resource: "ardsresource",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.EditResource] - [HTTP]  - Request received -  Data - %s %s', JSON.stringify(req.body), JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.EditResource(req.params.ResourceId, att.ResClass, att.ResType, att.ResCategory, tenantId, companyId, att.ResourceName, att.OtherData,req.user.iss, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.EditResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.EditResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/Resource/:ResourceId', authorization({
    resource: "ardsresource",
    action: "delete"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.DeleteResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.DeleteResource(req.params.ResourceId,tenantId,companyId,req.user.iss, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.DeleteResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.DeleteResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Resources', authorization({
    resource: "ardsresource",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAllResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));


        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.GetAllResource(tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetAllResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetAllResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/ResourceCount', authorization({
    resource: "ardsresource",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetResourceCount] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));


        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.GetResourceCount(tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetResourceCount] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetResourceCount] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Resources/:RowCount/:PageNo', authorization({
    resource: "ardsresource",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAllResourcePage] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));


        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.GetAllResourcePage(req,tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetAllResourcePage] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetAllResourcePage] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Resource/:ResourceId', authorization({
    resource: "ardsresource",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAllResourceById] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));


        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.GetAllResourceById(req.params.ResourceId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetAllResourceById] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetAllResourceById] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.post('/DVP/API/' + version + '/ResourceManager/Resource/:ResourceId/Tasks/:TaskId', authorization({
    resource: "ardsresource",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.AssignTaskToResource] - [HTTP]  - Request received -  Data - %s -%s', JSON.stringify(req.body), JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.AssignTaskToResource(req.params.ResourceId, req.params.TaskId, tenantId, companyId, att.Concurrency, att.RefInfo, att.OtherData, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.AssignTaskToResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.AssignTaskToResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/Resource/:ResourceId/Tasks/:TaskId', authorization({
    resource: "ardsresource",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.UpdateAssignTaskToResource] - [HTTP]  - Request received -  Data - %s -%s', JSON.stringify(req.body), JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.UpdateAssignTaskToResource(req.params.ResourceId, req.params.TaskId, tenantId, companyId, att.Concurrency, att.RefInfo, att.OtherData, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.UpdateAssignTaskToResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.UpdateAssignTaskToResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Resource/:ResourceId/Tasks', authorization({
    resource: "ardsresource",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetTaskByResourceId] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.GetTaskByResourceId(req.params.ResourceId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetTaskByResourceId] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetTaskByResourceId] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Resource/Task/:TaskId', authorization({
    resource: "ardsresource",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetResourceByTaskId] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));


        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.GetResourceByTaskId(req.params.TaskId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetResourceByTaskId] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetResourceByTaskId] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/Resource/:ResourceId/Task/:TaskId', authorization({
    resource: "ardsresource",
    action: "delete"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.RemoveTaskFromResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.RemoveTaskFromResource(req.params.ResourceId, req.params.TaskId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.RemoveTaskFromResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.RemoveTaskFromResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/Resource/:ResourceId/Task', authorization({
    resource: "ardsresource",
    action: "delete"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.RemoveAllTasksAssignToResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.RemoveAllTasksAssignToResource(req.params.ResourceId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.RemoveAllTasksAssignToResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.RemoveAllTasksAssignToResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.post('/DVP/API/' + version + '/ResourceManager/Resource/:ResourceId/Status', authorization({
    resource: "ardsresource",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[Resource Handler.AddStatusChangeInfo] - [HTTP]  - Request received -  Data - %s -%s', JSON.stringify(req.body), JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.AddStatusChangeInfo(req.params.ResourceId, tenantId, companyId, att.StatusType, att.Status, att.Reason, att.OtherData, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.AssignTaskToResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.AssignTaskToResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.post('/DVP/API/' + version + '/ResourceManager/Resource/:ResourceId/StatusDuration', authorization({
    resource: "ardsresource",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[Resource Handler.AddStatusDurationInfo] - [HTTP]  - Request received -  Data - %s -%s', JSON.stringify(req.body), JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.AddStatusDurationInfo(req.params.ResourceId, tenantId, companyId, att.StatusType, att.Status, att.Reason, att.OtherData, att.SessionId, att.Duration, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.AddStatusDurationInfo] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.AddStatusDurationInfo] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.post('/DVP/API/' + version + '/ResourceManager/Resource/:ResourceId/TaskRejectInfo', authorization({
    resource: "ardsresource",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[Resource Handler.AddTaskRejectInfo] - [HTTP]  - Request received -  Data - %s -%s', JSON.stringify(req.body), JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.AddTaskRejectInfo(req.params.ResourceId, tenantId, companyId, att.Task, att.Reason, att.OtherData, att.SessionId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.AddTaskRejectInfo] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.AddTaskRejectInfo] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/profile/:profileName', authorization({
    resource: "ardsresource",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetResourceByTaskId] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));


        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.ResourceNameIsExsists(req.params.profileName, res);
    }
    catch (ex) {

        logger.error('[groupsHandler.GetResourceByTaskId] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetResourceByTaskId] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

///ResResourceAttributeTask

RestServer.post('/DVP/API/' + version + '/ResourceManager/ResourceTask/:ResTaskId/Attribute/:AttributeId', authorization({
    resource: "resourcetaskattribute",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[AddAttributeToResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.AddAttributeToResource(req.params, req.body, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('AddAttributeToResource - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('AddAttributeToResource - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/ResourceTaskAttribute/:ResAttId', authorization({
    resource: "resourcetaskattribute",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[EditAttributeToResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.EditAttributeToResource(req.params, req.body, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('EditAttributeToResource - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('EditAttributeToResource - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/ResourceTaskAttribute/:ResAttId', authorization({
    resource: "resourcetaskattribute",
    action: "delete"
}), function (req, res, next) {
    try {

        logger.info('[DeleteAttributeToResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.DeleteAttributeToResource(req.params, req.body, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('DeleteAttributeToResource - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('DeleteAttributeToResource - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/ResourceTaskAttribute', authorization({
    resource: "resourcetaskattribute",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[ViewAttributeToResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.ViewAttributeToResource(req.params, req.body, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('ViewAttributeToResource - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('ViewAttributeToResource - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/ResourceTaskAttribute/:ResAttId', authorization({
    resource: "resourcetaskattribute",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[ViewAttributeToResourceByResAttId] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.ViewAttributeToResourceByResAttId(req.params, req.body, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('ViewAttributeToResourceByResAttId - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('ViewAttributeToResourceByResAttId - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/ResourceTask/:ResTaskId/Attributes', authorization({
    resource: "resourcetaskattribute",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[ViewAttributeToResourceByResTaskId] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.ViewAttributeToResourceByResTaskId(req.params, req.body, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('ViewAttributeToResourceByResTaskId - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('ViewAttributeToResourceByResTaskId - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});
//-------------------------End Resource Handler ------------------------- \\

//------------------------- Task Handler ------------------------- \\

RestServer.post('/DVP/API/' + version + '/ResourceManager/Task', authorization({
    resource: "task",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[taskHandler.CreateTask] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        taskHandler.CreateTask(tenantId, companyId, att.TaskInfoId, att.OtherData, att.AddToProductivity, res);

    }
    catch (ex) {

        logger.error('[taskHandler.CreateTask] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[taskHandler.CreateTask] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/Task/:TaskId', authorization({
    resource: "task",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[taskHandler.EditTask] - [HTTP]  - Request received -  Data - %s -%s', JSON.stringify(req.body), JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        taskHandler.EditTask(req.params.TaskId, tenantId, companyId, att.TaskName, att.OtherData, att.AddToProductivity, res);

    }
    catch (ex) {

        logger.error('[taskHandler.EditTask] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[taskHandler.EditTask] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/Task/:TaskId', authorization({
    resource: "task",
    action: "delete"
}), function (req, res, next) {
    try {

        logger.info('[taskHandler.DeleteTask] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        taskHandler.DeleteTask(req.params.TaskId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[taskHandler.DeleteTask] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[taskHandler.DeleteTask] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Tasks', authorization({
    resource: "task",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[taskHandler.GetAllTasks] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        taskHandler.GetAllTasks(tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[taskHandler.GetAllTasks] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[taskHandler.GetAllTasks] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Task/:TaskId', authorization({
    resource: "task",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[taskHandler.GetTaskById] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        taskHandler.GetTaskById(req.params.TaskId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[taskHandler.GetTaskById] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[taskHandler.GetTaskById] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Task/:TaskId/Resources', authorization({
    resource: "task",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetResourceByTaskId] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        resourceHandler.GetResourceByTaskId(req.params.TaskId, tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetResourceByTaskId] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetResourceByTaskId] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});


//-------------------------End Task Handler ------------------------- \\

//-------------------------Productivity Handler ------------------------- \\
RestServer.get('/DVP/API/' + version + '/ResourceManager/Resources/Productivity', authorization({
    resource: "productivity",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[productivityHandler.Productivity] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        productivityHandler.Productivity(req,res,companyId,tenantId);
    }
    catch (ex) {
        logger.error('[productivityHandler.Productivity] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[productivityHandler.Productivity] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/:ResourceId/Productivity', authorization({
    resource: "productivity",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[productivityHandler.Productivity] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        productivityHandler.ProductivityByResourceId(req,res,companyId,tenantId);
    }
    catch (ex) {
        logger.error('[productivityHandler.Productivity] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[productivityHandler.Productivity] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/:ResourceId/Productivity/ACW', authorization({
    resource: "productivity",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[productivityHandler.GetAcwTime] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        productivityHandler.GetAcwTime(req,res,companyId,tenantId);
    }
    catch (ex) {
        logger.error('[productivityHandler.GetAcwTime] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[productivityHandler.GetAcwTime] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/:ResourceId/Productivity/BreakTime', authorization({
    resource: "productivity",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[productivityHandler.GetBreakTime] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        productivityHandler.GetBreakTime(req,res,companyId,tenantId);
    }
    catch (ex) {
        logger.error('[productivityHandler.GetBreakTime] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[productivityHandler.GetBreakTime] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/:ResourceId/Productivity/HoldTime', authorization({
    resource: "productivity",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[productivityHandler.GetHoldTime] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        productivityHandler.GetHoldTime(req,res,companyId,tenantId);
    }
    catch (ex) {
        logger.error('[productivityHandler.GetHoldTime] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[productivityHandler.GetHoldTime] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/:ResourceId/Productivity/IdleTime', authorization({
    resource: "productivity",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[productivityHandler.GetIdleTime] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        productivityHandler.GetIdleTime(req,res,companyId,tenantId);
    }
    catch (ex) {
        logger.error('[productivityHandler.GetIdleTime] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[productivityHandler.GetIdleTime] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/:ResourceId/Productivity/IncomingCallCount', authorization({
    resource: "productivity",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[productivityHandler.GetIncomingCallCount] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        productivityHandler.GetIncomingCallCount(req,res,companyId,tenantId);
    }
    catch (ex) {
        logger.error('[productivityHandler.GetIncomingCallCount] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[productivityHandler.GetIncomingCallCount] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/:ResourceId/Productivity/OnCallTime', authorization({
    resource: "productivity",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[productivityHandler.GetOnCallTime] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        productivityHandler.GetOnCallTime(req,res,companyId,tenantId);
    }
    catch (ex) {
        logger.error('[productivityHandler.GetOnCallTime] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[productivityHandler.GetOnCallTime] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/:ResourceId/Productivity/StaffedTime', authorization({
    resource: "productivity",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[productivityHandler.GetStaffedTime] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        productivityHandler.GetStaffedTime(req,res,companyId,tenantId);
    }
    catch (ex) {
        logger.error('[productivityHandler.GetStaffedTime] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[productivityHandler.GetStaffedTime] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/:ResourceId/Productivity/TransferCallCount', authorization({
    resource: "productivity",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[productivityHandler.GetTransferCallCount] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        productivityHandler.GetTransferCallCount(req,res,companyId,tenantId);
    }
    catch (ex) {
        logger.error('[productivityHandler.GetTransferCallCount] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[productivityHandler.GetTransferCallCount] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Resources/Productivity/Summary/from/:summaryFromDate/to/:summaryToDate', authorization({
    resource: "productivity",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[productivitySummaryHandler.GetDailySummaryRecords] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        productivitySummaryHandler.GetDailySummaryRecords(tenantId, companyId, req.params.summaryFromDate, req.params.summaryToDate, res);
    }
    catch (ex) {
        logger.error('[productivitySummaryHandler.GetDailySummaryRecords] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[productivitySummaryHandler.GetDailySummaryRecords] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

//-------------------------Productivity Handler end------------------------- \\

//-------------------------Shared Resource Handler ------------------------- \\

RestServer.post('/DVP/API/' + version + '/ResourceManager/Resource/:ResourceId/Task/:TaskId/Shared', authorization({
    resource: "Shared",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[sharedResourceHandler.SharedResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        sharedResourceHandler.SharedResource(tenantId,companyId,req,res);
    }
    catch (ex) {
        logger.error('[sharedResourceHandler.SharedResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[sharedResourceHandler.SharedResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});


RestServer.post('/DVP/API/' + version + '/ResourceManager/Resource/:ResourceId/Task/:TaskId/Shared/Assign', authorization({
    resource: "Shared",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[sharedResourceHandler.AssignTaskToResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        sharedResourceHandler.AssignTaskToResource(tenantId,companyId,req,res);
    }
    catch (ex) {
        logger.error('[sharedResourceHandler.AssignTaskToResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[sharedResourceHandler.AssignTaskToResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/Shared', authorization({
    resource: "Shared",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[sharedResourceHandler.GetSharedResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        sharedResourceHandler.GetSharedResource(tenantId,companyId,req,res);
    }
    catch (ex) {
        logger.error('[sharedResourceHandler.GetSharedResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[sharedResourceHandler.GetSharedResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

//-------------------------Shared Resource end------------------------- \\

//-------------------------TaskInfo Handler ------------------------- \\

RestServer.get('/DVP/API/' + version + '/ResourceManager/TaskInfo', authorization({
    resource: "taskinfo",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[GetAllTasks.GetAllTasks] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = req.user.tenant;
        var companyId = req.user.company;
        taskInfoHandler.GetAllTasks(tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[GetAllTasks.GetAllTasks] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[GetAllTasks.GetAllTasks] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

//-------------------------End TaskInfo Handler ------------------------- \\




//------------------------Resource Break Types--------------------------


RestServer.post('/DVP/API/' + version + '/ResourceManager/BreakTypes', authorization({
    resource: "breaktype",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[breakTypeHandler.CreateBreakType] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = parseInt(req.user.tenant);
        var companyId = parseInt(req.user.company);
        breakTypeHandler.CreateBreakType(tenantId, companyId, att.BreakType, att.MaxDurationPerDay, res);

    }
    catch (ex) {

        logger.error('[breakTypeHandler.CreateBreakType] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[breakTypeHandler.CreateBreakType] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/BreakType/:BreakType', authorization({
    resource: "breaktype",
    action: "write"
}), function (req, res, next) {
    try {

        logger.info('[breakTypeHandler.EditBreakTypeStatus] - [HTTP]  - Request received -  Data - %s %s', JSON.stringify(req.body), JSON.stringify(req.params));

        var att = req.body;
        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = parseInt(req.user.tenant);
        var companyId = parseInt(req.user.company);
        breakTypeHandler.EditBreakTypeStatus(tenantId, companyId, req.params.BreakType, att.Active, att.MaxDurationPerDay, res);

    }
    catch (ex) {

        logger.error('[breakTypeHandler.EditBreakTypeStatus] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[breakTypeHandler.EditBreakTypeStatus] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/BreakType/:BreakType', authorization({
    resource: "breaktype",
    action: "delete"
}), function (req, res, next) {
    try {

        logger.info('[breakTypeHandler.DeleteBreakType] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = parseInt(req.user.tenant);
        var companyId = parseInt(req.user.company);
        breakTypeHandler.DeleteBreakType(tenantId, companyId, req.params.BreakType, res);

    }
    catch (ex) {

        logger.error('[breakTypeHandler.DeleteBreakType] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[breakTypeHandler.DeleteBreakType] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/BreakTypes', authorization({
    resource: "breaktype",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[breakTypeHandler.GetAllBreakTypes] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));


        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = parseInt(req.user.tenant);
        var companyId = parseInt(req.user.company);
        breakTypeHandler.GetAllBreakTypes(tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[breakTypeHandler.GetAllBreakTypes] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[breakTypeHandler.GetAllBreakTypes] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/BreakTypes/Active', authorization({
    resource: "breaktype",
    action: "read"
}), function (req, res, next) {
    try {

        logger.info('[breakTypeHandler.GetAllActiveBreakTypes] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));


        if (!req.user ||!req.user.tenant || !req.user.company)
            throw new Error("invalid tenant or company.");
        var tenantId = parseInt(req.user.tenant);
        var companyId = parseInt(req.user.company);
        breakTypeHandler.GetAllActiveBreakTypes(tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[breakTypeHandler.GetAllActiveBreakTypes] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[breakTypeHandler.GetAllActiveBreakTypes] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

//------------------------End Break Types-------------------------------






//------------------------- Crossdomain ------------------------- \\

function Crossdomain(req, res, next) {


    var xml = '<?xml version=""1.0""?><!DOCTYPE cross-domain-policy SYSTEM ""http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd""> <cross-domain-policy>    <allow-access-from domain=""*"" />        </cross-domain-policy>';

    /*var xml='<?xml version="1.0"?>\n';

     xml+= '<!DOCTYPE cross-domain-policy SYSTEM "/xml/dtds/cross-domain-policy.dtd">\n';
     xml+='';
     xml+=' \n';
     xml+='\n';
     xml+='';*/
    req.setEncoding('utf8');
    res.end(xml);

}

function Clientaccesspolicy(req, res, next) {


    var xml = '<?xml version="1.0" encoding="utf-8" ?>       <access-policy>        <cross-domain-access>        <policy>        <allow-from http-request-headers="*" http-methods="*">        <domain uri="*"/>        </allow-from>        <grant-to>        <resource include-subpaths="true" path="/"/>        </grant-to>        </policy>        </cross-domain-access>        </access-policy>';
    req.setEncoding('utf8');
    res.end(xml);

}

RestServer.get("/crossdomain.xml", Crossdomain);
RestServer.get("/clientaccesspolicy.xml", Clientaccesspolicy);

//------------------------- End Crossdomain ------------------------- \\