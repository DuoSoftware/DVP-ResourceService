
module.exports = function(sequelize, DataTypes) {
    var SwarmNode = sequelize.define('CSDB_SwarmNode', {
            UUID: {type:DataTypes.STRING, primaryKey:true},
            Name: DataTypes.STRING,
            Status: DataTypes.BOOLEAN,
            Code: DataTypes.STRING,
            Company: DataTypes.INTEGER,
            Tenant: DataTypes.INTEGER,
            Class: DataTypes.STRING,
            Type: DataTypes.STRING,
            Category: DataTypes.STRING,
            MainIP: DataTypes.STRING,
            RemotePort: DataTypes.INTEGER,
            Domain: DataTypes.STRING,
            HostDomain: DataTypes.STRING
        }
    );
    return SwarmNode;
};