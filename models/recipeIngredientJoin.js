module.exports = (sequelize, DataTypes) => {
    const RecipeIngredientJoin = sequelize.define('recipeIngredientJoin', {
        // Model attributes are defined here
        quantity: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        measurement: {
            type: DataTypes.ENUM(['teaspoon', 'tablespoon', 'cup', 'quart', 'gallon', 'lb', 'oz', 'pinch', 'whole']),
            allowNull: false,
        },
        prepInstructions: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        additionalInfo: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        neededInStep: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    });
    RecipeIngredientJoin.associate = (models) => {
        RecipeIngredientJoin.belongsTo(models.Recipe, {
            foreignKey: 'recipeUuid',
            onDelete: 'CASCADE'
        });
        RecipeIngredientJoin.belongsTo(models.Ingredient, {
            foreignKey: 'ingredientUuid',
            onDelete: 'CASCADE',
        });
    };

    return RecipeIngredientJoin;
};