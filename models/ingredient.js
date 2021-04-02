module.exports = (sequelize, DataTypes) => {
    const Ingredient = sequelize.define('Ingredient', {
        // Model attributes are defined here
        recipeUuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        dataFound: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default: false
        },
        flaggedForReview: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default: false
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    Ingredient.associate = (models) => {
        Ingredient.belongsToMany(models.Recipe, {
            through: 'recipeIngredientJoin',
            foreignKey: "recipeUuid"
        });
    }
    return Ingredient;
};