const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require('../models/index');
const User = require('../controllers/user');
const Recipe = require('../controllers/recipe');
const recipe = require("../models/recipe");
const { patch } = require("../app");

let token;
let sampleRecipeUuid;

describe("Auth Routes Test", function() {
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
        let u1 = await User.createUser({
            email: "asdf@asdf.com",
            password: "password",
            userName: "Test1"
        });
        let u2 = await User.createUser({
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
        let r1 = await Recipe.createRecipe(newRecipe);
        sampleRecipeUuid = r1.recipeUuid;
        let response = await request(app)
            .post("/auth/token")
            .send({ userName: "Test2", password: "test" });
        token = response.body.token;
    });

    /**
     * GET /recipes
     * return list of recipes
     */
    describe("GET /recipes", function() {
        test("can get a list of recipes", async function() {
            let response = await request(app)
                .get('/recipes')
                .set('Authorization', `Bearer ${token}`);
            let count = response.body.recipes ? response.body.recipes.count : 0;
            expect(count).toEqual(1);
        });
        test("cannot get a list of recipes if not logged in", async function() {
            let response = await request(app)
                .get("/recipes");
            expect(response.statusCode).toBe(401);
        });
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
                .set('Authorization', `Bearer ${token}`);
            expect(response.body.validMessage).toEqual("Recipe has been created");
            response = await request(app)
                .get('/recipes')
                .set('Authorization', `Bearer ${token}`);
            expect(response.body.recipes.count).toEqual(2);
        });
    });

    /**
     * PATCH /recipes
     */
    describe("PATCH /recipes", function() {
        test("can patch an existing recipe", async function() {
            const changedInstructions = {
                recipeUuid: sampleRecipeUuid,
                instructions: "Lots of cats, so many cats"
            };
            let response = await request(app)
                .patch(`/recipes`)
                .send(changedInstructions)
                .set('Authorization', `Bearer ${token}`);
            expect(response.body.instructions).toEqual(changedInstructions.instructions);
        });
        test("can't patch a recipe if not logged in", async function() {
            const changedInstructions = {
                recipeUuid: sampleRecipeUuid,
                instructions: "Lots of cats, so many cats"
            };
            let response = await request(app)
                .patch(`/recipes`)
                .send(changedInstructions);
            expect(response.statusCode).toBe(401);
        });
        test("can't patch a recipe if not the user/admin", async function() {
            let response = await request(app)
                .post("/auth/token")
                .send({ userName: "Test1", password: "password" });
            token = response.body.token;
            const changedInstructions = {
                recipeUuid: sampleRecipeUuid,
                instructions: "Lots of cats, so many cats"
            };
            response = await request(app)
                .patch(`/recipes`)
                .send(changedInstructions)
                .set('Authorization', `Bearer ${token}`);
            expect(response.statusCode).toBe(403);

        });
    });
    /**
     * DELETE /recipes/[recipeUuid]
     */
    describe("DELETE /recipes/[recipeUuid]", function() {
        test("can delete a recipe", async function() {
            let response = await request(app)
                .delete(`/recipes/${sampleRecipeUuid}`)
                .set('Authorization', `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("recipe deleted");
        });
    });

    afterAll(async function() {
        await db.sequelize.close();
    });
});