const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const db = require('../models/index');
const User = require('../controllers/user');
const Recipe = require('../controllers/recipe');

const { chickenSalad, rasam, humus, moroccanlentilsoup, bethsSoupBroth } = require("../seeding/testData");

describe("Test the ingredients route(s)", function() {
    let u1, u2;
    let r1, r2, r3, r4, r5;
    let token1, token2;

    beforeAll(async function() {
        await db.sequelize.sync({ force: true }).then(() => {
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

        chickenSalad.userUuId = u1.userUuId;
        rasam.userUuId = u1.userUuId;
        humus.userUuId = u2.userUuId;
        moroccanlentilsoup.userUuId = u2.userUuId;
        bethsSoupBroth.userUuId = u1.userUuId;

        r1 = await Recipe.createRecipe(bethsSoupBroth);
        r2 = await Recipe.createRecipe(chickenSalad);
        r3 = await Recipe.createRecipe(rasam);
        r4 = await Recipe.createRecipe(humus);
        r5 = await Recipe.createRecipe(moroccanlentilsoup);

        let response = await request(app)
            .post("/auth/token")
            .send({ userName: "Test1", password: "password" });
        token1 = response.body.token;
    });

    describe("GET /ingredients/?lookup=Cil", function() {
        test("can get ingredients that have 'Cil' in their label", async function() {
            response = await request(app)
                .get('/ingredients?lookup=Cil')
                .set('Authorization', `Bearer ${token1}`);
            expect(response.body.ingredients).toContainEqual(expect.objectContaining({ label: 'Cilantro' }));
        });
        test("can get ingredients that have 'cil' in their label (case insensitive)", async function() {
            // let response = await request(app)
            //     .post("/auth/token")
            //     .send({ userName: "Test1", password: "password" });
            // token1 = response.body.token;
            response = await request(app)
                .get('/ingredients?lookup=cil')
                .set('Authorization', `Bearer ${token1}`);
            expect(response.body.ingredients).toContainEqual(expect.objectContaining({ label: 'Cilantro' }));
        });
        test("can get ingredients that have 'CIL' in their label", async function() {
            // let response = await request(app)
            //     .post("/auth/token")
            //     .send({ userName: "Test1", password: "password" });
            // token1 = response.body.token;
            response = await request(app)
                .get('/ingredients?lookup=CIL')
                .set('Authorization', `Bearer ${token1}`);
            expect(response.body.ingredients).toContainEqual(expect.objectContaining({ label: 'Cilantro' }));
        });
        test("can get ingredients that have 'tomat' in their label", async function() {
            // let response = await request(app)
            //     .post("/auth/token")
            //     .send({ userName: "Test1", password: "password" });
            // token1 = response.body.token;
            response = await request(app)
                .get('/ingredients?lookup=tomat')
                .set('Authorization', `Bearer ${token1}`);
            expect(response.body.ingredients).toContainEqual(expect.objectContaining({ label: 'Tomato Paste' }));
            expect(response.body.ingredients).toContainEqual(expect.objectContaining({ label: 'Tomato' }));
        });
        test("can get ingredients that have 'tomat' in their label", async function() {
            // let response = await request(app)
            //     .post("/auth/token")
            //     .send({ userName: "Test1", password: "password" });
            // token1 = response.body.token;
            response = await request(app)
                .get('/ingredients?lookup=okr')
                .set('Authorization', `Bearer ${token1}`);
            expect(response.body.ingredients).toEqual([]);
        });
        test("can get ingredients that have 'tomat' in their label", async function() {
            // let response = await request(app)
            //     .post("/auth/token")
            //     .send({ userName: "Test1", password: "password" });
            // token1 = response.body.token;
            response = await request(app)
                .get('/ingredients?lookup=tom')
                .set('Authorization', `Bearer ${token1}`);
            expect(response.body.ingredients).toContainEqual(expect.objectContaining({ label: 'Tomato Paste' }));
            expect(response.body.ingredients).toContainEqual(expect.objectContaining({ label: 'Tomato' }));
        });
    });

    afterAll(async function() {
        await db.sequelize.close();
    });

})