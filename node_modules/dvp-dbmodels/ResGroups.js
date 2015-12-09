/**
 * Created by Rajinda on 9/30/2015.
 */



module.exports = function (sequelize, DataTypes) {
    var ResGroups = sequelize.define('DB_RES_Groups', {
            GroupName: {type:DataTypes.STRING,unique: 'ResGroupsCompositeIndex'},
            GroupClass: {type:DataTypes.STRING,unique: 'ResGroupsCompositeIndex'},
            GroupType: {type:DataTypes.STRING,unique: 'ResGroupsCompositeIndex'},
            GroupCategory:  {type:DataTypes.STRING,unique: 'ResGroupsCompositeIndex'},
            TenantId: {type:DataTypes.INTEGER,unique: 'ResGroupsCompositeIndex'},
            CompanyId: {type:DataTypes.INTEGER,unique: 'ResGroupsCompositeIndex'},
            OtherData: DataTypes.STRING,
            Status: DataTypes.BOOLEAN,
            Percentage: DataTypes.INTEGER,
            GroupId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
        }
    );


    return ResGroups;
};