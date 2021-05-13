module.exports = (sequelize, DataTypes) => {
    const UserUserJoins = sequelize.define('userUserJoins', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        accepted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    });

    UserUserJoins.associate = (models) => {
        UserUserJoins.belongsTo(models.User, {
                foreignKey: "requestorUuId",
                as: "requestor",
                onDelete: 'CASCADE'
            }),
            UserUserJoins.belongsTo(models.User, {
                foreignKey: "targetUuId",
                as: "target",
                onDelete: 'CASCADE'
            })
    };

    // UserUserJoins.associate = (models) => {
    //     UserUserJoins.belongsTo(models.User)
    // }

    return UserUserJoins;
}