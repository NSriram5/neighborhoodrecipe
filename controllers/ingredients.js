const Sequelize = require('sequelize');
const Ingredient = require('../models').Ingredient;
const Op = require('../models/').Sequelize.Op;

const createIngredient = async function(ingredient) {
    try {
        const [ing, created] = await Ingredient.findOrCreate({
            where: { label: ingredient.label },
            attributes: ["label", "ingredientUuid"]
        });
        if (created) {
            //console.log("ingredient created");
        } else {
            //console.log("ingredient found");
        }
        return { ingredientUuid: ing.ingredientUuid, label: ing.label };
    } catch (err) {
        console.log(err);
    }
}

const getIngredient = async function(filter) {
    let whereclause;
    whereclause = {};
    if (filter.label) {
        whereclause.label = {
            [Op.iLike]: filter.label
        };
    }
    return Ingredient
        .findAll({
            where: whereclause,
            attributes: ["label", "dataFound", "flaggedForReview", "ingredientUuid"],
            //raw: true,
        })
        .then((result) => {
            return result[0];
        })
        .catch(error => {
            console.log(error, 'There was an error getting an ingredient');
        });
}

const getAutoComplete = async function(partialLabel) {
    whereclause = Sequelize.where(Sequelize.fn('lower', Sequelize.col('label')), {
        [Op.iLike]: '%' + partialLabel + '%'
    });
    return Ingredient.findAll({
            where: whereclause,
            attributes: ["label"]
        })
        .then((result) => {
            return result;
        })
        .catch(error => {
            console.log(err)
            return err;
        })
}

const getAllIngredients = async function(filter) {
    let whereclause;
    whereclause = {};
    if (filter.label) {
        whereclause.label = {
            [Op.iLike]: '%' + filter.label + '%'
        };
    }
    return Ingredient.findAll({
            where: whereclause,
            attributes: ["label", "dataFound", "flaggedForReview", "ingredientUuid"],
            //raw: true,
        })
        .then((result) => { return result; })
        .catch(error => {
            console.log(error, 'There was an error retrieving Ingredients');
        });
}

module.exports = {
    createIngredient,
    getIngredient,
    getAllIngredients,
    getAutoComplete
}