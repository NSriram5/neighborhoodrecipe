"use strict";

/** Routes for recipes. */

const jsonschema = require("jsonschema");
const recipeNew = require("../schemas/recipeNew.json");
const recipeUpdateSchema = require("../schemas/recipeUpdate.json");
const Recipe = require("../controllers/recipe");
const express = require("express");
const router = new express.Router();
const bcrypt = require("bcrypt");
const { createToken } = require("../helpers/tokens");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const { BadRequestError, ForbiddenError } = require("../expressError");

/**
 * GET / => render recipes list
 * 
 * Returns rendered list of all recipes.
 * 
 * Authorization required: login and admin
 */
router.get("/", ensureLoggedIn, ensureAdmin, async function(req, res, next) {
    try {
        const recipes = await Recipe.getRecipe();
        return res.json({ recipes: recipes });
    } catch (err) {
        console.log(err);
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
        if (res.locals.user.userId != recipe.userUuId && !res.locals.user.admin) {
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
router.delete(":/recipeUuid", ensureLoggedIn, async function(req, res, next) {
    try {
        const recipe = await Recipe.getRecipe(req, params.recipeUuid);
        if (res.locals.user.isAdmin == false && res.locals.user.username != recipe.user) {
            throw new ForbiddenError("Only an admin or the user of this account can delete this recipe");
        }
        await recipe.remove(req.params.id);
        return res.json({ message: "recipe deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;