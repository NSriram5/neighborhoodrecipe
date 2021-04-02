const Sequelize = require('sequelize');
const Ingredient = require('../models').Ingredient;
const Op = require('../models/').Sequelize.Op;
module.exports = {
    createIngredient(ingredient) {
        let whereclause = {};
        whereclause.Name = {
            [Op.iLike]: '%' + ingredient.label + '%'
        };
        return Ingredient
            .findOne({
                where: whereclause,
                attributes: ['recipeUuid', 'label']
            })
            .then((result) => {
                //console.log(result);
                if (result === null) {
                    console.log('couldnt find the ingredient, creating instead');
                    result = Ingredient.create(ingredient, { returning: ['recipeUuid', 'label'] });
                } else {
                    console.log('ingredient found');
                }
                return result;
            })
            .catch(error => {
                console.log(error, 'There was an error in with creating an ingredient');
            });
    },
    getIngredient(filter) {
        let whereclause;
        whereclause = {};
        if (filter.label) {
            whereclause.label = {
                [Op.iLike]: '%' + filter.label + '%'
            };
        }

        return Ingredient
            .findAll({
                where: whereclause,
                attributes: ["label"],
            })
            .then((result) => {
                console.log('Ingredient Found');
                return ingredient;
            })
            .catch(error => {
                console.log(error, 'There was an error getting an ingredient');
            });
    },

    getAllIngredients() {
        return Ingredient.findAll()
            .then((result) => { return result; })
            .catch(error => {
                console.log(error, 'There was an error retrieving Ingredients');
            });
    }
}