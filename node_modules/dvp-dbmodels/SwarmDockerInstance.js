
module.exports = function(sequelize, DataTypes) {
    var SwarmDockerInstance = sequelize.define('CSDB_SwarmDockerInstance', {
            Name: DataTypes.STRING,
            ParentApp: DataTypes.STRING,
            UUID: {type: DataTypes.STRING, unique: true},
            Code: DataTypes.STRING,
            Company: DataTypes.INTEGER,
            Tenant: DataTypes.INTEGER,
            Class: DataTypes.STRING,
            Type: DataTypes.STRING,
            Category: DataTypes.STRING,
            Status: DataTypes.STRING,
            FrontEnd: DataTypes.STRING,
            BackEnd: DataTypes.STRING,
            DeploymentUUID: DataTypes.STRING
        }
    );
    return SwarmDockerInstance;
};