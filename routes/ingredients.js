"use strict";

/** Routes for ingredients. */

const jsonschema = require("jsonschema");
const Ingredient = require("../controllers/ingredients");
const { ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError, ForbiddenError, ExpressError } = require("../expressError");

const express = require("express");
const router = new express.Router();

/**
 * GET / => all ingredients that match the query search parameters
 * Returns an array of strings ingredients.
 * 
 * Authorization required: login
 */
router.get("/", ensureLoggedIn, async function(req, res, next) {
    try {
        let partial = req.query.lookup;

        let matches = await Ingredient.getAutoComplete(partial);
        return res.json({ ingredients: matches });
    } catch (err) {
        console.log(err);
        return next(err);
    }
})

module.exports = router;