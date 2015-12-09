/**
 * Created by Rajinda on 10/20/2015.
 */


module.exports = function (sequelize, DataTypes) {
    var ResTaskInfo = sequelize.define('DB_RES_TaskInfo', {
            TaskClass: {type:DataTypes.STRING,unique: 'ResTaskInfoCompositeIndex'},
            TaskType: {type:DataTypes.STRING,unique: 'ResTaskInfoCompositeIndex'},
            TaskCategory: {type:DataTypes.STRING,unique: 'ResTaskInfoCompositeIndex'},
            TaskName: {type:DataTypes.STRING,unique: 'ResTaskInfoCompositeIndex'},
            OtherData: DataTypes.STRING,
            Status: DataTypes.BOOLEAN,
            TaskInfoId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
        }
    );

    return ResTaskInfo;
};