/**
 * Created by Rajinda on 9/29/2015.
 */


module.exports = function (sequelize, DataTypes) {
    var ResResourceTask = sequelize.define('DB_RES_ResourceTask', {
            ResourceId: {type:DataTypes.INTEGER,unique: 'ResResourceTaskCompositeIndex'},
            TaskId: {type:DataTypes.INTEGER,unique: 'ResResourceTaskCompositeIndex'},
            TenantId:  {type:DataTypes.INTEGER,unique: 'ResResourceTaskCompositeIndex'},
            CompanyId: {type:DataTypes.INTEGER,unique: 'ResResourceTaskCompositeIndex'},
            RefInfo: DataTypes.STRING,
            Concurrency: DataTypes.INTEGER,
            OtherData: DataTypes.STRING,
            Status: DataTypes.BOOLEAN,
            ResTaskId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
        }
    );


    return ResResourceTask;
};