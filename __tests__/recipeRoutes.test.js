const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require('../models/index');
const User = require('../controllers/user');
const Recipe = require('../controllers/recipe');
const recipe = require("../models/recipe");
const { patch } = require("../app");

let token, token2;
let sampleRecipeUuid, sampleRecipeUuid2;

describe("Recipe routes test", function() {
    let u1, u2

    beforeAll(async function() {
        await db.sequelize.sync(true).then(() => {
                console.log('Database connection has been established.');
            })
            .catch((err) => {
                console.error("Unable to connect to the database", err);
            });
    });
    beforeEach(async function() {
        await db.sequelize.query('DELETE FROM "Users"');
        await db.sequelize.query('DELETE FROM "Recipes"');
        await db.sequelize.query('DELETE FROM "Ingredients"');
        await db.sequelize.query('DELETE FROM "recipeIngredientJoins"');
        u1 = await User.createUser({
            email: "asdf@asdf.com",
            password: "password",
            userName: "Test1"
        });
        u2 = await User.createUser({
            email: "jklfuntimes@jklfuntimes.com",
            password: "test",
            userName: "Test2",
            isAdmin: true
        });
        const newRecipe = {
            recipeName: "test1",
            servingCount: 5,
            farenheitTemp: 250,
            minuteTotalTime: 45,
            instructions: "Hello there",
            toolsNeeded: "My old friend",
            userUuId: u1.userUuId,
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
        const secondRecipe = {
            recipeName: "test2",
            servingCount: 10,
            farenheitTemp: 500,
            minuteTotalTime: 90,
            instructions: "Hello there",
            toolsNeeded: "My old friend",
            userUuId: u2.userUuId,
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

        const chickenSalad = {
            recipeName: "Chicken Salad",
            servingCount: 6,
            minuteTotalTime: 15,
            instructions: "1. Combine all ingredients in a small bowl and mix well./n2. Season with salt and pepper to taste./n3.Serve as a sandwich or over salad.",
            toolsNeeded: "Spoon, knife, bowl",
            userUuId: u1.userUuId,
            ingredients: [{
                    quantity: 2,
                    measurement: "cup",
                    label: "chicken",
                    prepInstructions: "chopped"
                },
                {
                    quantity: 0.5,
                    measurement: "cup",
                    label: "mayonnaise"
                },
                {
                    quantity: 1,
                    measurement: "cup",
                    label: "celery stalk",
                    prepInstructions: "chopped"
                },
                {
                    quantity: 1,
                    measurement: "whole",
                    label: "green onion",
                    prepInstructions: "diced"
                },
                {
                    quantity: 1,
                    measurement: "teaspoon",
                    label: "seasoned salt"
                },
                {
                    quantity: 0,
                    measurement: "pinch",
                    label: "pepper",
                    prepInstructions: "to taste"
                }
            ]
        };
        let r1 = Recipe.createRecipe(newRecipe);
        let r2 = Recipe.createRecipe(secondRecipe);
        let r3 = Recipe.createRecipe(chickenSalad);
        [r1, r2, r3] = await Promise.all([r1, r2, r3]);
        sampleRecipeUuid1 = r1.recipeUuid;
        sampleRecipeUuid2 = r2.recipeUuid;
        chickenSaladUuid = r3.recipeUuid;
        let response = await request(app)
            .post("/auth/token")
            .send({ userName: "Test2", password: "test" });
        token2 = response.body.token;
        response = await request(app)
            .post("/auth/token")
            .send({ userName: "Test1", password: "password" });
        token1 = response.body.token;
    });

    /**
     * GET /recipes
     * return list of recipes
     */
    describe("GET /recipes/adminall", function() {
        test("can get a list of recipes", async function() {
            let response = await request(app)
                .get('/recipes/adminall')
                .set('Authorization', `Bearer ${token2}`);
            let count = response.body.recipes ? response.body.recipes.count : 0;
            expect(count).toEqual(3);
        });
        test("cannot get a list of recipes if not logged in", async function() {
            let response = await request(app)
                .get("/recipes/adminall");
            expect(response.statusCode).toBe(401);
        });
    });


    describe("GET /recipes/view", function() {
        test("can get list of recipes associated with a user and their friends", async function() {
            await User.inviteUser(u1.userUuId, u2.userUuId);
            await User.acceptUser(u2.userUuId, u1.userUuId);
            let response = await request(app)
                .get('/recipes/view')
                .set('Authorization', `Bearer ${token1}`);
            expect(response.body.recipes).toEqual(expect.arrayContaining([expect.objectContaining({ recipeName: "test2" })]));
        });
        test("can get a list of recipes associated with a user if the friendship exchange is reversed",
            async function() {
                await User.inviteUser(u2.userUuId, u1.userUuId);
                await User.acceptUser(u1.userUuId, u2.userUuId);
                let response = await request(app)
                    .get('/recipes/view')
                    .set('Authorization', `Bearer ${token1}`);
                expect(response.body.recipes).toEqual(expect.arrayContaining([expect.objectContaining({ recipeName: "test2" })]));
            });
        test("if friendship isn't established then we can't see the other user's recipe", async function() {
            let response = await request(app)
                .get('/recipes/view')
                .set('Authorization', `Bearer ${token1}`);
            expect(response.body.recipes).toEqual(expect.not.arrayContaining([expect.objectContaining({ recipeName: "test2" })]));
        });
    });

    /**
     * GET /recipes/[recipeUuid]
     * return a recipe based on a specific Uuid
     */
    describe("GET /recipes/:recipeUuid", function() {
        test("can get a recipe when the accesss user is the owner of the recipe", async function() {
            let response = await request(app)
                .get(`/recipes/${sampleRecipeUuid1}`)
                .set('Authorization', `Bearer ${token1}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.rows).toContainEqual(expect.objectContaining({
                instructions: 'Hello there',
                recipeName: 'test1'
            }));
        });
        test("can get a recipe when the access user is an admin", async function() {
            let response = await request(app)
                .get(`/recipes/${sampleRecipeUuid1}`)
                .set('Authorization', `Bearer ${token2}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.rows).toContainEqual(expect.objectContaining({
                instructions: 'Hello there',
                recipeName: 'test1'
            }));
        });
        test("can't get a recipe when the access user is neither an admin nor the owner of the recipe", async function() {

            let response = await request(app)
                .get(`/recipes/${sampleRecipeUuid2}`)
                .set('Authorization', `Bearer ${token1}`);
            expect(response.statusCode).toBe(403);

        });
    })

    /**
     * GET /recipes/recipeUuid]
     * returns a recipe with updated API data
     */
    describe("GET /recipes/research/:recipeUuid", function() {
        // test("can get a recipe data from an external api", async function() {
        //     let response = await request(app)
        //         .get(`/recipes/research/${chickenSaladUuid}`)
        //         .set(`Authorization`, `Bearer ${token1}`);
        //     expect(response.statusCode).toBe(200);
        //     expect(response.body.edamamETag).toBeTruthy();
        // });
    });

    /**
     * POST /recipes
     * post a new recipe
     */
    describe("POST /recipes", function() {
        test("can post a new recipe to the route", async function() {
            const newRecipe = {
                recipeName: "test2",
                servingCount: 1,
                farenheitTemp: 3,
                minuteTotalTime: 1,
                instructions: "Hello there",
                toolsNeeded: "My old friend",
                ingredients: [{
                        quantity: 20,
                        measurement: "cup",
                        label: "sand",
                        prepInstructions: "chopped",
                        additionalInfo: "my favorite"
                            //}
                    },
                    {
                        quantity: 5,
                        measurement: "tablespoon",
                        label: "pins"
                    }
                ]
            };
            let response = await request(app)
                .post("/recipes")
                .send(newRecipe)
                .set('Authorization', `Bearer ${token1}`);
            expect(response.body.validMessage).toEqual("Recipe has been created");
            response = await request(app)
                .get('/recipes/adminall')
                .set('Authorization', `Bearer ${token1}`);
            expect(response.body.recipes.count).toEqual(4);
        });
    });

    /**
     * PATCH /recipes
     */
    describe("PATCH /recipes", function() {
        test("can patch an existing recipe", async function() {
            const changedInstructions = {
                recipeUuid: sampleRecipeUuid1,
                instructions: "Lots of cats, so many cats"
            };
            let response = await request(app)
                .patch(`/recipes`)
                .send(changedInstructions)
                .set('Authorization', `Bearer ${token1}`);
            expect(response.body.instructions).toEqual(changedInstructions.instructions);
        });
        test("can't patch a recipe if not logged in", async function() {
            const changedInstructions = {
                recipeUuid: sampleRecipeUuid2,
                instructions: "Lots of cats, so many cats"
            };
            let response = await request(app)
                .patch(`/recipes`)
                .send(changedInstructions);
            expect(response.statusCode).toBe(401);
        });
        test("can't patch a recipe if not the user/admin", async function() {
            const changedInstructions = {
                recipeUuid: sampleRecipeUuid2,
                instructions: "Lots of cats, so many cats"
            };
            response = await request(app)
                .patch(`/recipes`)
                .send(changedInstructions)
                .set('Authorization', `Bearer ${token1}`);
            expect(response.statusCode).toBe(403);

        });
    });
    /**
     * DELETE /recipes/[recipeUuid]
     */
    describe("DELETE /recipes/[recipeUuid]", function() {
        test("can delete a recipe", async function() {
            let response = await request(app)
                .delete(`/recipes/${sampleRecipeUuid1}`)
                .set('Authorization', `Bearer ${token1}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("recipe deleted");
        });
    });

    afterAll(async function() {
        await db.sequelize.close();
    });
});