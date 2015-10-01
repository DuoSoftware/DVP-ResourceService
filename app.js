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

//-------------------------  Restify Server ------------------------- \\
var RestServer = restify.createServer({
    name: "ResourceService",
    version: '1.0.0'
}, function (req, res) {

});
restify.CORS.ALLOW_HEADERS.push('api_key');

RestServer.use(restify.CORS());
RestServer.use(restify.fullResponse());
//Enable request body parsing(access)
RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());

//Server listen
RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);


});


//------------------------- End Restify Server ------------------------- \\

//------------------------- Attribute Handler ------------------------- \\

RestServer.post('/DVP/API/' + version + '/ResourceManager/AttributeHandler/Attribute', function (req, res, next) {
    try {

        logger.info('[attributeHandler.CreateAttribute] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var att = req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[attributeHandler.CreateAttribute-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

RestServer.put('/DVP/API/' + version + '/ResourceManager/AttributeHandler/Attribute/:AttributeId', function (req, res, next) {
    try {

        logger.info('[attributeHandler.EditAttribute] - [HTTP]  - Request received -  Data - %s  - %s', JSON.stringify(req.body),JSON.stringify(req.params));

        var att = req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[attributeHandler.EditAttribute-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        attributeHandler.EditAttribute(req.params.AttributeId,att.Attribute, att.AttClass, att.AttType, att.AttCategory, tenantId, companyId, att.OtherData, res);

    }
    catch (ex) {

        logger.error('[attributeHandler.EditAttribute] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[attributeHandler.EditAttribute] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/AttributeHandler/Attribute/:AttributeId', function (req, res, next) {
    try {

        logger.info('[attributeHandler.DeleteAttribute] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var att = req.params;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[attributeHandler.DeleteAttribute-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

RestServer.get('/DVP/API/' + version + '/ResourceManager/AttributeHandler/Attribute', function (req, res, next) {
    try {

        logger.info('[attributeHandler.GetAllAttribute] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[attributeHandler.GetAllAttribute-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

RestServer.get('/DVP/API/' + version + '/ResourceManager/AttributeHandler/Attribute/:RowCount/:PageNo', function (req, res, next) {
    try {

        logger.info('[attributeHandler.GetAllAttribute] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));
    var att=req.params;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[attributeHandler.GetAllAttribute-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

RestServer.get('/DVP/API/' + version + '/ResourceManager/AttributeHandler/Attribute/:AttributeId', function (req, res, next) {
    try {

        logger.info('[attributeHandler.GetAttributeById] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));
var att=req.params;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[attributeHandler.GetAttributeById-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

RestServer.get('/DVP/API/' + version + '/ResourceManager/AttributeHandler/Attribute/:AttributeId/Details', function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetGroupDetailsByAttributeId] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.GetGroupDetailsByAttributeId-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

//------------------------- End Attribute Handler ------------------------- \\

//------------------------- Group Handler ------------------------- \\

RestServer.post('/DVP/API/' + version + '/ResourceManager/GroupHandler/Group', function (req, res, next) {
    try {

        logger.info('[groupsHandler.CreateGroups] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var att = req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.CreateGroups-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        groupsHandler.CreateGroups(att.GroupName, att.GroupClass, att.GroupType, att.GroupCategory, tenantId, companyId, att.OtherData, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.CreateGroups] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.CreateGroups] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/GroupHandler/Group/:GroupId', function (req, res, next) {
    try {

        logger.info('[groupsHandler.EditGroups] - [HTTP]  - Request received -  Data - %s - %s ', JSON.stringify(req.body),JSON.stringify(req.params));

        var att = req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.EditGroups-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        groupsHandler.EditGroups(req.params.GroupId, att.GroupName, att.GroupClass, att.GroupType, att.GroupCategory, tenantId, companyId, att.OtherData, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.EditGroups] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.EditGroups] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/GroupHandler/Group/:GroupId', function (req, res, next) {
    try {

        logger.info('[groupsHandler.DeleteGroups] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.DeleteGroups-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

RestServer.get('/DVP/API/' + version + '/ResourceManager/GroupHandler/Group', function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAllGroups] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.GetAllGroups-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

RestServer.get('/DVP/API/' + version + '/ResourceManager/GroupHandler/Groups/:RowCount/:PageNo', function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAllGroups] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.GetAllGroups-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

RestServer.get('/DVP/API/' + version + '/ResourceManager/GroupHandler/Group/:GroupId', function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAllGroups] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.GetAllGroups-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

RestServer.post('/DVP/API/' + version + '/ResourceManager/GroupHandler/Group/Attribute', function (req, res, next) {
    try {

        logger.info('[groupsHandler.AddAttributeToGroups] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var att = req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.AddAttributeToGroups-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

RestServer.put('/DVP/API/' + version + '/ResourceManager/GroupHandler/Group/:GroupId/Attribute', function (req, res, next) {
    try {

        logger.info('[groupsHandler.AddAttributeToExsistingGroups] - [HTTP]  - Request received -  Data - %s - %s ', JSON.stringify(req.body),JSON.stringify(req.params));

        var att = req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.AddAttributeToExsistingGroups-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

RestServer.get('/DVP/API/' + version + '/ResourceManager/GroupHandler/Group/:GroupId/Attribute', function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAttributeByGroupId] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.GetAttributeByGroupId-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

RestServer.get('/DVP/API/' + version + '/ResourceManager/GroupHandler/Group/:GroupId/Attribute/Details', function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAttributeByGroupId] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.GetAttributeByGroupId-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
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

RestServer.del('/DVP/API/' + version + '/ResourceManager/GroupHandler/Group/:GroupId/Attribute/:AttributeId', function (req, res, next) {
    try {

        logger.info('[groupsHandler.DeleteAttributeFromGroup] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.DeleteAttributeFromGroup-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        groupsHandler.DeleteAttributeFromGroup(req.params.GroupId,req.params.AttributeId ,tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[groupsHandler.DeleteAttributeFromGroup] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.DeleteAttributeFromGroup] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

//-------------------------End Group Handler ------------------------- \\

//------------------------- Resource Handler ------------------------- \\

RestServer.post('/DVP/API/' + version + '/ResourceManager/ResourceHandler/Resource', function (req, res, next) {
    try {

        logger.info('[groupsHandler.CreateResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var att = req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.CreateResource-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        resourceHandler.CreateResource(att.ResClass, att.ResType, att.ResCategory, tenantId, companyId, att.ResourceName, att.OtherData, res) ;

    }
    catch (ex) {

        logger.error('[groupsHandler.CreateResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.CreateResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/ResourceHandler/Resource/:ResourceId', function (req, res, next) {
    try {

        logger.info('[groupsHandler.EditResource] - [HTTP]  - Request received -  Data - %s %s', JSON.stringify(req.body), JSON.stringify(req.params));

        var att = req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.EditResource-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        resourceHandler.EditResource(req.params.ResourceId,att.ResClass, att.ResType, att.ResCategory, tenantId, companyId, att.ResourceName, att.OtherData, res) ;

    }
    catch (ex) {

        logger.error('[groupsHandler.EditResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.EditResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/ResourceHandler/Resource/:ResourceId', function (req, res, next) {
    try {

        logger.info('[groupsHandler.DeleteResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));


        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.DeleteResource-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        resourceHandler.DeleteResource(req.params.ResourceId,  res) ;

    }
    catch (ex) {

        logger.error('[groupsHandler.DeleteResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.DeleteResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/ResourceHandler/Resource', function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAllResource] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));


        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.GetAllResource-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        resourceHandler.GetAllResource(tenantId, companyId, res) ;

    }
    catch (ex) {

        logger.error('[groupsHandler.GetAllResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetAllResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/ResourceHandler/Resource/:ResourceId', function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetAllResourceById] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));


        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.GetAllResourceById-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        resourceHandler.GetAllResourceById(req.params.ResourceId,tenantId, companyId, res) ;

    }
    catch (ex) {

        logger.error('[groupsHandler.GetAllResourceById] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetAllResourceById] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/ResourceHandler/Resource/:ResourceId/Tasks/:TaskId', function (req, res, next) {
    try {

        logger.info('[groupsHandler.AssignTaskToResource] - [HTTP]  - Request received -  Data - %s -%s',JSON.stringify(req.body), JSON.stringify(req.params));

var att=req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.AssignTaskToResource-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        resourceHandler.AssignTaskToResource(req.params.ResourceId,req.params.TaskId,tenantId,companyId,att.Concurrency,att.RefInfo,att.OtherData,res) ;

    }
    catch (ex) {

        logger.error('[groupsHandler.AssignTaskToResource] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.AssignTaskToResource] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/ResourceHandler/Resource/:ResourceId/Tasks', function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetTaskByResourceId] - [HTTP]  - Request received -  Data - %s ',JSON.stringify(req.params));

        var att=req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.GetTaskByResourceId-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        resourceHandler.GetTaskByResourceId(req.params.ResourceId,tenantId,companyId,res);

    }
    catch (ex) {

        logger.error('[groupsHandler.GetTaskByResourceId] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[groupsHandler.GetTaskByResourceId] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

//-------------------------End Resource Handler ------------------------- \\

//------------------------- Task Handler ------------------------- \\

RestServer.post('/DVP/API/' + version + '/ResourceManager/TaskHandler/Task', function (req, res, next) {
    try {

        logger.info('[taskHandler.CreateTask] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var att = req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[taskHandler.CreateTask-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        taskHandler.CreateTask(att.TaskClass, att.TaskType, att.TaskCategory, tenantId, companyId, att.TaskName, att.OtherData, res);

    }
    catch (ex) {

        logger.error('[taskHandler.CreateTask] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[taskHandler.CreateTask] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.put('/DVP/API/' + version + '/ResourceManager/TaskHandler/Task/:TaskId', function (req, res, next) {
    try {

        logger.info('[taskHandler.EditTask] - [HTTP]  - Request received -  Data - %s -%s', JSON.stringify(req.body),JSON.stringify(req.params));

        var att = req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[taskHandler.EditTask-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        taskHandler.EditTask(req.params.TaskId,att.TaskClass, att.TaskType, att.TaskCategory, tenantId, companyId, att.TaskName, att.OtherData, res);

    }
    catch (ex) {

        logger.error('[taskHandler.EditTask] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[taskHandler.EditTask] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.del('/DVP/API/' + version + '/ResourceManager/TaskHandler/Task/:TaskId', function (req, res, next) {
    try {

        logger.info('[taskHandler.DeleteTask] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var att = req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[taskHandler.DeleteTask-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        taskHandler.DeleteTask(req.params.TaskId,tenantId, companyId, res);

    }
    catch (ex) {

        logger.error('[taskHandler.DeleteTask] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[taskHandler.DeleteTask] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/TaskHandler/Task', function (req, res, next) {
    try {

        logger.info('[taskHandler.GetAllTasks] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var att = req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[taskHandler.GetAllTasks-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        taskHandler.GetAllTasks(tenantId, companyId,  res);

    }
    catch (ex) {

        logger.error('[taskHandler.GetAllTasks] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[taskHandler.GetAllTasks] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/TaskHandler/Task/:TaskId', function (req, res, next) {
    try {

        logger.info('[taskHandler.GetTaskById] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));


        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[taskHandler.GetTaskById-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        taskHandler.GetTaskById(req.params.TaskId,tenantId, companyId,  res);

    }
    catch (ex) {

        logger.error('[taskHandler.GetTaskById] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        logger.debug('[taskHandler.GetTaskById] - Request response : %s ', jsonString);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/ResourceManager/TaskHandler/Task/:TaskId/Resources', function (req, res, next) {
    try {

        logger.info('[groupsHandler.GetResourceByTaskId] - [HTTP]  - Request received -  Data - %s ',JSON.stringify(req.params));

        var att=req.body;
        var tenantId = 1;
        var companyId = 1;
        try {
            var auth = req.header('authorization');
            var authInfo = auth.split("#");

            if (authInfo.length >= 2) {
                tenantId = authInfo[0];
                companyId = authInfo[1];
            }
        }
        catch (ex) {
            logger.error('[groupsHandler.GetResourceByTaskId-authorization] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
        }
        resourceHandler.GetResourceByTaskId(req.params.TaskId,tenantId,companyId,res);

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