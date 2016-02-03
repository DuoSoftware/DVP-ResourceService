/**
 * Created by Rajinda on 9/29/2015.
 */


module.exports = function (sequelize, DataTypes) {
    var ResResource = sequelize.define('DB_RES_Resource', {
            ResClass: {type:DataTypes.STRING,unique: 'ResResourceCompositeIndex'},
            ResType: {type:DataTypes.STRING,unique: 'ResResourceCompositeIndex'},
            ResCategory: {type:DataTypes.STRING,unique: 'ResResourceCompositeIndex'},
            TenantId:  {type:DataTypes.INTEGER,unique: 'ResResourceCompositeIndex'},
            CompanyId: {type:DataTypes.INTEGER,unique: 'ResResourceCompositeIndex'},
            ResourceName: {type:DataTypes.STRING,unique: 'ResResourceCompositeIndex'},
            OtherData: DataTypes.STRING,
            Status: DataTypes.BOOLEAN,
            ResourceId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
        }
    );


    return ResResource;
};