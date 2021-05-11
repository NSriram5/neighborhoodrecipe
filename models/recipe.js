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
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true,
        },
        dietCategory: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true,
        },
        flatCategories: {
            type: DataTypes.TEXT,
            allowNull: true
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
        minuteCookTime: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        instructions: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true,
        },
        flatInstructions: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        flatIngredients: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        toolsNeeded: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        disabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        photoUrl: {
            type: DataTypes.TEXT,
            defaultValue: "",
            allowNull: true
        },
        edamamETag: {
            type: DataTypes.STRING,
            defaultValue: "",
            allowNull: true
        },
        dietLabels: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            defaultValue: [],
            allowNull: true
        },
        healthLabels: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            defaultValue: [],
            allowNull: true
        },
        kCals: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: true
        },
        fat: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: true
        },
        fatsat: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: true
        },
        fattrans: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: true
        },
        carbs: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: true
        },
        fiber: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: true
        },
        sugar: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: true
        },
        protein: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: true
        },
        cholesterol: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: true
        },
        sodium: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: true
        },
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