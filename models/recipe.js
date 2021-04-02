module.exports = (sequelize, DataTypes) => {
    const Recipe = sequelize.define('Recipe', {
        // Model attributes are defined here
        recipeUuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        recipeName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mealCategory: {
            type: DataTypes.ENUM(['dinner', 'lunch', 'breakfast', 'snack', 'desert']),
            allowNull: true,
        },
        dietCategory: {
            type: DataTypes.ENUM(['vegetarian', 'vegan', 'glutenfree', 'kosher']),
            allowNull: true,
        },
        servingCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        websiteReference: {
            type: DataTypes.STRING,
            allowNull: true
        },
        farenheitTemp: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        minuteTimeBake: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        minuteTotalTime: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        minutePrepTime: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        instructions: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        toolsNeeded: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        disabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default: false
        }
    });
    Recipe.associate = (models) => {
        Recipe.belongsTo(models.User, {
            foreignKey: 'userUuId',
            allowNull: true,
        });
        Recipe.belongsToMany(models.Ingredient, {
            through: 'recipeIngredientJoin',
            foreignKey: "recipeUuid",
            onDelete: 'CASCADE'
        });


    }
    return Recipe;
}