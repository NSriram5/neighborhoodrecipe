const app = require("../app");
const db = require('../models/index');
const Recipe = require('../controllers/recipe');
const User = require('../controllers/user');
const UserUserJoins = require('../controllers/userUserJoins');
const RecipeIngredientJoin = require('../controllers/recipeIngredientJoin');

describe("Test recipe controller functions", function() {
    let uuId1, uuId2, uuId3;

    beforeAll(async function() {
        await db.sequelize.sync({ force: true }).then(() => {
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
        await db.sequelize.query('DELETE FROM "Users"');
        await db.sequelize.query('DELETE FROM "userUserJoins"');
        let u1 = await User.createUser({
            email: "asdf@asdf.com",
            password: "password",
            userName: "Test1"
        });
        let u2 = await User.createUser({
            email: "jklfuntimes@jklfuntimes.com",
            password: "badpassword",
            userName: "Test2",
            isAdmin: true
        });
        let u3 = await User.createUser({
            email: "princesandbag@gmail.com",
            password: "badpassword",
            userName: "Test3"
        });
        uuId1 = u1.userUuId;
        uuId2 = u2.userUuId;
        uuId3 = u3.userUuId;
        let recipe1 = await db.sequelize.query(`INSERT INTO "Recipes" ("recipeUuid","recipeName","disabled","createdAt","updatedAt","userUuId") VALUES ('40e6215d-b5c6-4896-987c-f30f3678f607','soup for my family','true','2004-10-19 10:23:54+02','2004-10-19 10:23:54+02','${uuId1}')`);
        let recipe2 = await db.sequelize.query(`INSERT INTO "Recipes" ("recipeUuid","recipeName","disabled","createdAt","updatedAt","userUuId") VALUES ('40e6215d-b5c6-4896-987c-f30f3678f608','untitled1','true','2004-10-19 10:23:54+02','2004-10-19 10:23:54+02','${uuId3}')`);
        let recipe3 = await db.sequelize.query(`INSERT INTO "Recipes" ("recipeUuid","recipeName","disabled","createdAt","updatedAt","userUuId") VALUES ('40e6215d-b5c6-4896-987c-f30f3678f609','untitled2','true','2004-10-19 10:23:54+02','2004-10-19 10:23:54+02','${uuId1}')`);
        await User.inviteUser(uuId1, uuId2);
        await User.acceptUser(uuId2, uuId1);
        await User.inviteUser(uuId3, uuId2);
        await User.acceptUser(uuId2, uuId3);
        let a = "cat";
    });

    /**
     * Use the controller to look for an existing recipe
     */
    describe("Get recipe", function() {
        test("can get a recipe that exists", async function() {
            const found = await Recipe.getRecipe({ recipeName: 'soup for my family' });
            expect(found.rows[0]).toEqual(expect.objectContaining({ recipeName: "soup for my family", recipeUuid: "40e6215d-b5c6-4896-987c-f30f3678f607", disabled: true }));
        });
        test("doesn't get a recipe if the filter is looking for the wrong thing", async function() {
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
                instructions: ["Hello there", "I'm playing banjo"],
                toolsNeeded: "My old friend"
            };
            const create = await Recipe.createRecipe(newRecipe);
            expect(create).toEqual(expect.objectContaining({ recipeName: "test", servingCount: 4, farenheitTemp: 350, minuteTotalTime: 45 }));
            const found = await Recipe.getRecipe({
                instructions: "there"
            });
            expect(found.rows[0]).toEqual(expect.objectContaining({ recipeName: "test", servingCount: 4, farenheitTemp: 350, minuteTotalTime: 45 }));
        });
        test("can make a complex recipe", async function() {
            const newRecipe = {
                recipeName: "test2",
                servingCount: 5,
                farenheitTemp: 250,
                minuteTotalTime: 45,
                instructions: ["Hello there"],
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
                instructions: ["Hello there"],
                toolsNeeded: "My old friend",
            }));
            const joins = await RecipeIngredientJoin.getRecipeIngredients({ recipeUuid: create.recipeUuid });
            expect(joins.length).toBeGreaterThan(0);
        });
    });

    /**
     * Get the more detailed view of the recipe
     */
    describe("Give the detailed breakdown on a recipe", function() {
        test("Can provide a detailed view of a recipe", async function() {
            const newRecipe = {
                recipeName: "test2",
                servingCount: 5,
                farenheitTemp: 250,
                minuteTotalTime: 45,
                instructions: ["Hello there"],
                toolsNeeded: "My old friend",
                ingredients: [{
                        quantity: 20,
                        measurement: "cup",
                        label: "fish",
                        prepInstructions: "chopped",
                        additionalInfo: "my favorite"
                    },
                    {
                        quantity: 5,
                        measurement: "tablespoon",
                        label: "broccoli"
                    }
                ]
            };
            const create = await Recipe.createRecipe(newRecipe);
            const found = await Recipe.getFullRecipe({ recipeName: "test2" });
            expect(found.servingCount).toEqual(5);
            expect(found.Ingredients.length).toEqual(2);

        });
    });

    /**
     * Delete a recipe
     */
    describe("Delete a recipe", function() {
        test("Can delete a recipe", async function() {
            const result = await Recipe.deleteRecipe({ recipeUuid: '40e6215d-b5c6-4896-987c-f30f3678f607' });
            expect(result.message).toEqual("delete successful");
            const find = await Recipe.getRecipe({ recipeUuid: '40e6215d-b5c6-4896-987c-f30f3678f607' });
            expect(find.count).toEqual(0);
        });
    });

    /**
     * Update a recipe
     */
    describe("Update a recipe", function() {
        test("Can update a recipe", async function() {
            let update = {
                recipeUuid: '40e6215d-b5c6-4896-987c-f30f3678f607',
                recipeName: 'soup for someone else',
                instructions: ['I just realized we needed to have instructions'],
                ingredients: [{
                    quantity: .25,
                    measurement: "teaspoon",
                    label: "pineapples",
                    prepInstructions: "prepared"
                }]
            }
            let result = await Recipe.updateRecipe(update);
            result = await Recipe.getFullRecipe({ recipeUuid: update.recipeUuid });
            expect(result).toEqual(expect.objectContaining({
                recipeName: 'soup for someone else',
                instructions: ['I just realized we needed to have instructions'],
            }));
            expect(result.Ingredients.length).toEqual(1);
        })
    });

    /**
     * Get a recipe that belongs to a specific user
     */
    describe("retrieve a user's recipe", function() {
        test("make a recipe then retrieve it based on user's uuid", async function() {
            const user = User.createUser({ password: "password", email: "a", userName: "a", isAdmin: false, disabled: false })
            const userUuId = user.userUuId;
            const newRecipe = {
                recipeName: "test",
                servingCount: 4,
                farenheitTemp: 350,
                minuteTotalTime: 45,
                instructions: ["Hello there"],
                toolsNeeded: "My old friend",
                userUuId: userUuId
            };
            const create = await Recipe.createRecipe(newRecipe);
            const retrieve = await Recipe.getMyRecipes(userUuId);
            //console.log(retrieve);
        });
        test("retrieve connected recipes", async function() {
            const retrieve = await Recipe.getMyRecipes(uuId2, connected = true);
            let cat = 12;
            expect(retrieve).toEqual(expect.arrayContaining([expect.objectContaining({ recipeName: 'untitled1' })]));
            expect(retrieve).toEqual(expect.arrayContaining([expect.objectContaining({ recipeName: 'untitled2' })]));
        });
    })

    afterAll(async function() {
        await db.sequelize.close();
    });
});