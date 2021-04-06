module.exports = (sequelize, DataTypes) => {
    const Ingredient = sequelize.define('Ingredient', {
        // Model attributes are defined here
        ingredientUuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        dataFound: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        flaggedForReview: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    Ingredient.associate = (models) => {
        Ingredient.belongsToMany(models.Recipe, {
            through: 'recipeIngredientJoin',
            foreignKey: "ingredientUuid"
        });
    }
    return Ingredient;
};