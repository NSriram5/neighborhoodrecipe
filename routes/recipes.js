"use strict";

/** Routes for recipes. */

const jsonschema = require("jsonschema");
const recipeNew = require("../schemas/recipeNew.json");
const recipeUpdateSchema = require("../schemas/recipeUpdate.json");
const Recipe = require("../controllers/recipe");
const User = require("../controllers/user");
const express = require("express");
const router = new express.Router();
const bcrypt = require("bcrypt");
const axios = require("axios");
const edamamId = require("../config/config").EDAMAM_ID;
const edamamKey = require("../config/config").EDAMAM_KEY;
const edamamUrl = require("../config/config").EDAMAM_URL;
const { createToken } = require("../helpers/tokens");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const { BadRequestError, ForbiddenError, ExpressError } = require("../expressError");

/**
 * GET / => render recipes list
 * 
 * Returns rendered list of all recipes.
 * 
 * Authorization required: login and admin
 */
router.get("/adminall", ensureLoggedIn, ensureAdmin, async function(req, res, next) {
    try {
        const recipes = await Recipe.getRecipe();
        return res.json({ recipes: recipes });
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

router.get("/view", ensureLoggedIn, async function(req, res, next) {
    try {
        let listedrecipes = await Recipe.getMyRecipes(res.locals.user.userUuId, true);
        return res.json({ recipes: listedrecipes });
    } catch (err) {
        console.log(err);
        return next(err);
    }
})

/**
 * GET /[uuid] => retrieve recipe details from the backend
 * 
 * Returns a json of the recipe
 * 
 * Authorization required: login
 */
router.get("/:recipeUuid", ensureLoggedIn, async function(req, res, next) {
    try {
        const recipe = await Recipe.getRecipe({ recipeUuid: req.params.recipeUuid });
        let recipeUser = recipe.rows[0];
        if (recipeUser.User.userUuId == res.locals.user.userUuId || recipeUser.User.userUuId == null || res.locals.user.isAdmin) {
            return res.json(recipe);
        }
        const connections = await User.getConnections(res.locals.user.userUuId);
        let accessible = false;
        for (connection of connections) {
            if (connection.accepted && (connection.targetUuId == recipe.user.userUuId || connection.requestorUuId == recipe.user.userUuId)) {
                return res.json(recipe);
            }
        }
        throw new ForbiddenError("You are not connected with the user that owns this recipe");
    } catch (err) {
        console.log(err);
        return next(err);
    }
})

/**
 * GET /research/[uuid] => retrieves a recipe's nutrition details from an online api
 * 
 * Returns a json of the recipe with updated recipe details
 * 
 * Authorization required: login
 */
router.get("/research/:recipeUuid", ensureLoggedIn, async function(req, res, next) {
    try {
        const recipe = await Recipe.getFullRecipe({ recipeUuid: req.params.recipeUuid });
        if (!recipe.kCals || !recipe.edamamETag) {
            let title = recipe.recipeName;
            let ingredients = recipe.Ingredients.map((item) => {
                return `${item.quantity ? item.quantity : ''} ${item.measurement ? item.measurement : ''} ${item.label ? item.label:''}, ${item.prepInstructions ? item.prepInstructions : ''}`.trim();
            });
            let apiUrl = `${edamamUrl}?app_id=${edamamId}&app_key=${edamamKey}`;
            let response = await axios.post(apiUrl, {
                app_id: edamamId,
                app_key: edamamKey,
                title: title,
                ingr: ingredients
            });
            let data = response.data;
            recipe.kCals = data.calories;
            recipe.edamamETag = data.uri;
            recipe.dietLabels = data.dietLabels;
            recipe.healthLabels = data.healthLabels;
            recipe.fat = data.totalNutrients["FAT"]["quantity"];
            recipe.fatsat = data.totalNutrients["FASAT"]["quantity"];
            recipe.fattrans = data.totalNutrients["FATRN"]["quantity"];
            recipe.carbs = data.totalNutrients["CHOCDF"]["quantity"];
            recipe.fiber = data.totalNutrients["FIBTG"]["quantity"];
            recipe.sugar = data.totalNutrients["SUGAR"]["quantity"];
            recipe.protein = data.totalNutrients["PROCNT"]["quantity"];
            recipe.cholesterol = data.totalNutrients["CHOLE"]["quantity"];
            recipe.sodium = data.totalNutrients["NA"]["quantity"];
            let updated = await Recipe.updateRecipe(recipe);
            return res.json(updated[1][0]);
        }
        return res.json({ message: "No updated needed" });
    } catch (err) {
        return next(err);
    }
});

/**
 * POST / => post a new recipe
 * 
 * Returns a success message
 * 
 * Authorization required: login 
 */
router.post("/", ensureLoggedIn, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, recipeNew);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        req.body.userUuId = res.locals.user.userUuId;
        const recipe = await Recipe.createRecipe(req.body);

        return res.json({ validMessage: "Recipe has been created" });
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

/**
 * PATCH /[uuid] => update recipe in the backend
 * 
 * Returns a json of the new recipe
 * 
 * Authorization required: login
 */
router.patch("/", ensureLoggedIn, async function(req, res, next) {
    try {
        const recipe = await Recipe.getFullRecipe({ recipeUuid: req.body.recipeUuid, isAdmin: true });
        if (res.locals.user.userUuId != recipe.userUuId && !res.locals.user.isAdmin) {
            throw new ForbiddenError("Only an admin or the user of this account can update these details");
        }

        const validator = jsonschema.validate(req.body, recipeUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        req.body["recipeUuid"] = recipe.recipeUuid;
        const updated = await Recipe.updateRecipe(req.body);
        return res.json(updated[1][0]);
    } catch (err) {
        return next(err);
    }
});

/**
 * DELETE /[uuid] => Remove recipe
 * 
 * Returns a message indicating that the recipe has been deleted
 * 
 * Authorization required: owner of recipe or admin
 */
router.delete("/:recipeUuid", ensureLoggedIn, async function(req, res, next) {
    try {
        const recipe = await Recipe.getRecipe({ recipeUuid: req.params.recipeUuid });
        if (res.locals.user.isAdmin == false && res.locals.user.username != recipe.user) {
            throw new ForbiddenError("Only an admin or the user of this account can delete this recipe");
        }
        let response = await Recipe.deleteRecipe(req.params.recipeUuid);
        if (response.message == "delete successful") {
            return res.json({ message: "recipe deleted" });
        }
        throw new ExpressError(response.message);
    } catch (err) {
        return next(err);
    }
});



module.exports = router;