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
    // UserUserJoins.associate = (models) => {
    //     UserUserJoins.belongsTo(models.User, {
    //             foreignKey: "userUuId",
    //             as: "requestorUuId",
    //             onDelete: 'CASCADE'
    //         }),
    //         UserUserJoins.belongsTo(models.User, {
    //             foreignKey: "userUuId",
    //             as: "targetUuId",
    //             onDelete: 'CASCADE'
    //         })
    // };

    return UserUserJoins;
}