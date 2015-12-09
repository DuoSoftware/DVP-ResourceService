/**
 * Created by Rajinda on 9/29/2015.
 */


module.exports = function (sequelize, DataTypes) {
    var ResTask = sequelize.define('DB_RES_Task', {
            TenantId:  {type:DataTypes.INTEGER,unique: 'ResTaskCompositeIndex'},
            CompanyId: {type:DataTypes.INTEGER,unique: 'ResTaskCompositeIndex'},
            TaskInfoId: {type:DataTypes.INTEGER,unique: 'ResTaskCompositeIndex'},
            OtherData: DataTypes.STRING,
            Status: DataTypes.BOOLEAN,
            TaskId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
        }
    );

    return ResTask;
};