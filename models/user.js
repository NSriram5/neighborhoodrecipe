module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        // Model attributes are defined here
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userName: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        disabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        userUuId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        }
    });
    User.associate = (models) => {
        User.hasMany(models.User, {
            foreignKey: "userUuId",
            onDelete: 'CASCADE'
        });

    };

    return User;
}