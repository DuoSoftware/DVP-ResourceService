/**
 * Created by Heshan.i on 10/1/2015.
 */
module.exports = function(sequelize, DataTypes) {
    var DashboardMetaData = sequelize.define('Dashboard_MetaData', {

            EventClass: {type:DataTypes.STRING,unique: 'DashboardMetaDataIndex'},
            EventType: {type:DataTypes.STRING,unique: 'DashboardMetaDataIndex'},
            EventCategory:{type:DataTypes.STRING,unique: 'DashboardMetaDataIndex'},
            WindowName:DataTypes.STRING,
            Count:DataTypes.INTEGER,
            FlushEnable:DataTypes.BOOLEAN,
            DashboardMetaDataId:{type:DataTypes.INTEGER, primaryKey:true,autoIncrement: true}

        }
    );
    return DashboardMetaData;
};