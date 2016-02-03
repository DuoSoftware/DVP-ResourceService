module.exports = function(sequelize, DataTypes) {
    var SwarmDockerEnvVariable = sequelize.define('CSDB_SwarmDockerEnvVariable', {
            Name: DataTypes.STRING,
            Value: DataTypes.STRING,
            Export: DataTypes.BOOLEAN
        }
    );


    return SwarmDockerEnvVariable;
};