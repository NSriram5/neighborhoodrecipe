const app = require("../app");
const db = require('../models/index');
const Ingredient = require('../controllers/ingredients');

describe("Test ingredient controller functions", function() {
    beforeAll(async function() {
        await db.sequelize.sync(true).then(() => {
                console.log('Database connection has been established.');
            })
            .catch((err) => {
                console.error("Unable to connect to the database", err);
            });
    });
    beforeEach(async function() {
        await db.sequelize.query('DELETE FROM "Ingredients"');
        let ing1 = await db.sequelize.query(`INSERT INTO "Ingredients" ("ingredientUuid","dataFound","flaggedForReview","label","createdAt","updatedAt") VALUES ('40e6215d-b5c6-4896-987c-f30f3678f608','true','true','pepper','2004-10-19 10:23:54+02','2004-10-19 10:23:54+02')`);
        let ing2 = await db.sequelize.query(`INSERT INTO "Ingredients" ("ingredientUuid","dataFound","flaggedForReview","label","createdAt","updatedAt") VALUES ('40e6215d-b5c6-4896-987c-f30f3678f609','true','true','pep','2004-10-19 10:23:54+02','2004-10-19 10:23:54+02')`);
    });

    /** 
     *  Use the controller to look for an ingredient or ingredients
     */
    describe("Get ingredients", function() {
        test("can get an ingredient that exists", async function() {
            const found = await Ingredient.getIngredient({ label: "pepper" });
            expect(found).toEqual({ label: "pepper", ingredientUuid: "40e6215d-b5c6-4896-987c-f30f3678f608", dataFound: true, flaggedForReview: true });
        });
        test("can get more ingredients that exist", async function() {
            const found = await Ingredient.getAllIngredients({ label: "pe" });
            expect(found).toEqual([{ label: "pepper", ingredientUuid: "40e6215d-b5c6-4896-987c-f30f3678f608", dataFound: true, flaggedForReview: true }, { label: "pep", ingredientUuid: "40e6215d-b5c6-4896-987c-f30f3678f609", dataFound: true, flaggedForReview: true }]);
        });
    });

    /**
     *  Use the controller to create an ingredient
     */
    describe("Make an ingredient", function() {
        test("can make a new ingredient", async function() {
            const newIngredient = { label: "kale" };
            const create = await Ingredient.createIngredient(newIngredient);
            expect(create).toEqual({ label: "kale", ingredientUuid: expect.any(String) })
        })
    })

    afterAll(async function() {
        await db.sequelize.close();
    });
})