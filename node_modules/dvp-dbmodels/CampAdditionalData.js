/**
 * Created by Rajinda on 9/3/2015.
 */


module.exports = function(sequelize, DataTypes) {
    var CampAdditionalData = sequelize.define('DB_CAMP_AdditionalData', {
            Class: {type:DataTypes.STRING,unique: 'CampAdditionalDataCompositeIndex'},
            Type:{type:DataTypes.STRING,unique: 'CampAdditionalDataCompositeIndex'},
            Category:{type:DataTypes.STRING,unique: 'CampAdditionalDataCompositeIndex'},
            TenantId:{type:DataTypes.INTEGER,unique: 'CampAdditionalDataCompositeIndex'},
            CompanyId:{type:DataTypes.INTEGER,unique: 'CampAdditionalDataCompositeIndex'},
            AdditionalData:{type:DataTypes.STRING},
            CampaignId:{type:DataTypes.INTEGER,unique: 'CampAdditionalDataCompositeIndex'},
            AdditionalDataId:{type:DataTypes.INTEGER, primaryKey:true,autoIncrement: true}
        }
    );
    return CampAdditionalData;
};
