/**
 * Created by Rajinda on 9/30/2015.
 */



module.exports = function (sequelize, DataTypes) {
    var ResAttributeGroups = sequelize.define('DB_RES_AttributeGroups', {
            AttributeId: {type:DataTypes.INTEGER,unique: 'ResAttributeGroupsCompositeIndex'},
            GroupId: {type:DataTypes.INTEGER,unique: 'ResAttributeGroupsCompositeIndex'},
            TenantId:  {type:DataTypes.INTEGER,unique: 'ResAttributeGroupsCompositeIndex'},
            CompanyId: {type:DataTypes.INTEGER,unique: 'ResAttributeGroupsCompositeIndex'},
            OtherData: DataTypes.STRING,
            Status: DataTypes.BOOLEAN,
            AttributeGroupId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
        }
    );


    return ResAttributeGroups;
};