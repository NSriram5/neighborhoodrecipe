const RecipeIngredientJoin = require('../models/').recipeIngredientJoin;
const Op = require('../models').Sequelize.Op;

const bulkCreate = async function(recipeIngredientList) {
    return RecipeIngredientJoin
        .bulkCreate(recipeIngredientList)
        .then((result) => {
            // console.log(result);
            console.log('successfully created ingredient-recipe joins');
            return result;
        })
        .catch((err) => {
            console.log(err);
            console.log('There was an error in the bulk creation of recipe-ingredients');
            return err;
        });
}

const getRecipeIngredients = async function(filter) {
    if (filter == undefined) {
        return { error: 'You must submit filter criteria' };
    }
    let whereclause = {};
    if (filter.recipeUuid) {
        whereclause.recipeUuid = filter.recipeUuid;
    } else if (filter.ingredientUuid) {
        whereclause.ingredientUuid = filter.ingredientUuid
    } else {
        return { error: 'you must submit filter criteria' };
    }

    return RecipeIngredientJoin
        .findAll({
            where: whereclause,
            returning: ['id', 'recipeUuid', 'ingredientUuid', 'quantity', 'measurement', 'prepInstructions', 'additionalInfo'],
            raw: true
        })
        .catch((error) => {
            console.log(error);
            return error;
        });
}

const updateOrCreateRecipeIngredient = async function(recipeIngredient) {
    console.log(recipeIngredient);
    return RecipeIngredientJoin
        .upsert(
            recipeIngredient)
        .then((result) => {
            console.log(result);
            console.log('successfully created ingredients');
            return result;
        })
        .catch((err) => {
            console.log(err);
            console.log('THere was an error in the  creation of recipe ingredients');
            return err;
        });
}

module.exports = {
    bulkCreate,
    getRecipeIngredients,
    updateOrCreateRecipeIngredient

}