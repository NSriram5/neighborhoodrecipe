const app = require("../app");
const db = require('../models/index');
const Recipe = require('../controllers/recipe');
const RecipeIngredientJoin = require('../controllers/recipeIngredientJoin');

describe("Test recipe controller functions", function() {
    beforeAll(async function() {
        await db.sequelize.sync(true).then(() => {
                console.log('Database connection has been established.');
            })
            .catch((err) => {
                console.error("Unable to connect to the database", err);
            });
    });
    beforeEach(async function() {
        await db.sequelize.query('DELETE FROM "Recipes"');
        await db.sequelize.query('DELETE FROM "Ingredients"');
        await db.sequelize.query('DELETE FROM "recipeIngredientJoins"');
        let recipe1 = await db.sequelize.query(`INSERT INTO "Recipes" ("recipeUuid","recipeName","disabled","createdAt","updatedAt") VALUES ('40e6215d-b5c6-4896-987c-f30f3678f607','soup for my family','true','2004-10-19 10:23:54+02','2004-10-19 10:23:54+02')`);
    });

    /**
     * Use the controller to look for an existing recipe
     */
    describe("Get recipe", function() {
        test("can get a recipe that exists", async function() {
            const found = await Recipe.getRecipe({ recipeName: 'soup for my family' });
            expect(found.rows[0]).toEqual({ recipeName: "soup for my family", recipeUuid: "40e6215d-b5c6-4896-987c-f30f3678f607", disabled: true, dietCategory: null, farenheitTemp: null, instructions: null, mealCategory: null, minutePrepTime: null, minuteTimeBake: null, minuteTotalTime: null, servingCount: null, toolsNeeded: null, websiteReference: null });
        });
        test("doesn't get a recipe if the filter is looks for the wrong thing", async function() {
            const found = await Recipe.getRecipe({ recipeName: 'shamsham shamina' });
            expect(found.count).toEqual(0);
            expect(found.rows.length).toEqual(0);
        });
    });

    /**
     * Use the controller to create a new recipe
     */
    describe("Make recipe", function() {
        test("can make a recipe", async function() {
            const newRecipe = {
                recipeName: "test",
                servingCount: 4,
                farenheitTemp: 350,
                minuteTotalTime: 45,
                instructions: "Hello there",
                toolsNeeded: "My old friend"
            };
            const create = await Recipe.createRecipe(newRecipe);
            expect(create).toEqual(expect.objectContaining(newRecipe));
            const found = await Recipe.getRecipe({
                instructions: "there"
            });
            expect(found.rows[0]).toEqual(expect.objectContaining(newRecipe));
        });
        test("can make a complex recipe", async function() {
            const newRecipe = {
                recipeName: "test2",
                servingCount: 5,
                farenheitTemp: 250,
                minuteTotalTime: 45,
                instructions: "Hello there",
                toolsNeeded: "My old friend",
                ingredients: [{
                        quantity: 20,
                        measurement: "cup",
                        label: "fish",
                        prepInstructions: "chopped",
                        additionalInfo: "my favorite"
                            //}
                    },
                    {
                        quantity: 5,
                        measurement: "tablespoon",
                        label: "broccoli"
                    }
                ]
            };
            const create = await Recipe.createRecipe(newRecipe);
            expect(create).toEqual(expect.objectContaining({
                recipeName: "test2",
                servingCount: 5,
                farenheitTemp: 250,
                minuteTotalTime: 45,
                instructions: "Hello there",
                toolsNeeded: "My old friend",
            }));
            const joins = await RecipeIngredientJoin.getRecipeIngredients({ recipeUuid: create.recipeUuid });
            expect(joins.length).toBeGreaterThan(0);
        });

    });
    afterAll(async function() {
        await db.sequelize.close();
    });
})