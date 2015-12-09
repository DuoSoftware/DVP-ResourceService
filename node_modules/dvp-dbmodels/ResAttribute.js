/**
 * Created by Rajinda on 9/29/2015.
 */


module.exports = function (sequelize, DataTypes) {
    var ResAttribute = sequelize.define('DB_RES_Attribute', {
            Attribute: {type:DataTypes.STRING,unique: 'ResAttributeCompositeIndex'},
            AttClass: {type:DataTypes.STRING,unique: 'ResAttributeCompositeIndex'},
            AttType:  {type:DataTypes.STRING,unique: 'ResAttributeCompositeIndex'},
            AttCategory: {type:DataTypes.STRING,unique: 'ResAttributeCompositeIndex'},
            TenantId:  {type:DataTypes.INTEGER,unique: 'ResAttributeCompositeIndex'},
            CompanyId:  {type:DataTypes.INTEGER,unique: 'ResAttributeCompositeIndex'},
            OtherData: DataTypes.STRING,
            Status: DataTypes.BOOLEAN,
            AttributeId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
        }
    );


    return ResAttribute;
};