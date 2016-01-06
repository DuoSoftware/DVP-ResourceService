/**
 * Created by Rajinda on 9/29/2015.
 */




module.exports = function (sequelize, DataTypes) {
    var ResResourceAttributeTask = sequelize.define('DB_RES_ResourceAttributeTask', {
            Percentage: DataTypes.INTEGER,
            AttributeId: {type:DataTypes.INTEGER,unique: 'ResResourceAttributeTaskCompositeIndex'},
            ResTaskId: {type:DataTypes.INTEGER,unique: 'ResResourceAttributeTaskCompositeIndex'},
            TenantId:  {type:DataTypes.INTEGER,unique: 'ResResourceAttributeTaskCompositeIndex'},
            CompanyId:  {type:DataTypes.INTEGER,unique: 'ResResourceAttributeTaskCompositeIndex'},
            OtherData: DataTypes.STRING,
            Status: DataTypes.BOOLEAN,
            ResAttId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
        }
    );


    return ResResourceAttributeTask;
};