module.exports = function(sequelize, DataTypes) {
    var SipNetworkProfile = sequelize.define('CSDB_SipNetworkProfile', {
            MainIp: DataTypes.STRING,
            ProfileName: DataTypes.STRING,
            InternalIp: DataTypes.STRING,
            InternalRtpIp: DataTypes.STRING,
            ExternalIp: DataTypes.STRING,
            ExternalRtpIp: DataTypes.STRING,
            Port: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER
        }
    );


    return SipNetworkProfile;
};