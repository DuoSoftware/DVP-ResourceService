/**
 * Created by Pawan on 9/26/2017.
 */
var productivityHandler = require('./ProductivityHandler');
var redisArdsClient=productivityHandler.redisArdsClient;



module.exports.AddNewQueueSettingRecord = function (recordId,resQueue,callback) {

    try {

        var settingData = JSON.stringify(resQueue);

        redisArdsClient.hset('QueueNameHash',recordId, settingData, function (errSet, resSet) {
            callback(errSet, resSet);
        });
    } catch (e) {
        callback(e, undefined);
    }
}
module.exports.RemoveQueueSettingRecord = function (recordId,callback) {

    try {



        redisArdsClient.hdel('QueueNameHash',recordId, function (errSet, resSet) {
            callback(errSet, resSet);
        });
    } catch (e) {
        callback(e, undefined);
    }
}

