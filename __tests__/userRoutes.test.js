const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const db = require("../models/index");
const User = require("../controllers/user");
const UserUserJoins = require("../controllers/userUserJoins");


describe("Test all user routes", function() {
    let u1, u2, token1, token2;

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
        await db.sequelize.query('DELETE FROM "userUserJoins"');
        u1 = User.createUser({
            email: "asdf@asdf.com",
            password: "password",
            userName: "Test1",
            wantsNutritionData: true
        });
        u2 = User.createUser({
            email: "jklfuntimes@jklfuntimes.com",
            password: "test",
            userName: "Test2",
            isAdmin: true
        });
        [u1, u2] = await Promise.all([u1, u2]);
        let response = await request(app)
            .post("/auth/token")
            .send({ userName: "Test2", password: "test" });
        token2 = response.body.token;
        response = await request(app)
            .post("/auth/token")
            .send({ userName: "Test1", password: "password" });
        token1 = response.body.token;
    })

    describe("Get a user's info by UuId", function() {
        test("an admin can get another user's info", async function() {
            let response = await request(app)
                .get(`/users/${u1.userUuId}`)
                .set('Authorization', `Bearer ${token2}`);
            let visible = response.body.user;
            expect(response.body.user).toEqual(expect.objectContaining({
                userName: "Test1",
                email: "asdf@asdf.com"
            }));
        });

        test("a user can get their own info", async function() {
            let response = await request(app)
                .get(`/users/${u1.userUuId}`)
                .set('Authorization', `Bearer ${token1}`);
            expect(response.body.user).toEqual(expect.objectContaining({
                userName: "Test1",
                email: "asdf@asdf.com"
            }));
        });

        test("a user cannot get another user's info if not admin", async function() {
            let response = await request(app)
                .get(`/users/${u2.userUuId}`)
                .set('Authorization', `Bearer ${token1}`);
            expect(response.status).toEqual(403);
        });
    });

    describe("Update a user's info with new information", function() {
        test("u1 changes password, username, and indicates they don't want nutrition data", async function() {
            let { updatedAt, createdAt, ...useritems } = u1;
            useritems.wantsNutritionData = false;
            useritems.password = "treeforest";
            useritems.userName = "treebeard";
            let response = await request(app)
                .post(`/users/${u1.userUuId}`)
                .send(useritems)
                .set('Authorization', `Bearer ${token1}`);
            expect(response.status).toEqual(200);
            expect(response.body).toEqual(expect.objectContaining({ userName: "treebeard", wantsNutritionData: false }));
        })
    })

    describe("Initiate a connection with a user", function() {
        test("u1 sends a connection request to u2", async function() {
            let response = await request(app)
                .post(`/users/connect/${u2.userUuId}`)
                .set('Authorization', `Bearer ${token1}`);
            expect(response.status).toEqual(200);
            let connection = await UserUserJoins.checkIfConnected(u1.userUuId, u2.userUuId);
            expect(connection).toEqual(expect.objectContaining({ accepted: false }));
        });
    });

    describe("Accept a connection with another user", function() {
        test("u1 sends a connection request to u2. u2 accepts", async function() {
            let response = await request(app)
                .post(`/users/connect/${u2.userUuId}`)
                .set('Authorization', `Bearer ${token1}`);
            expect(response.status).toEqual(200);
            response = await request(app)
                .post(`/users/connect/${u1.userUuId}`)
                .set('Authorization', `Bearer ${token2}`);
            expect(response.status).toEqual(200);
            let connection = await UserUserJoins.checkIfConnected(u1.userUuId, u2.userUuId);
            expect(connection).toEqual(expect.objectContaining({ accepted: true }));
        });


    });

    describe("Remove a connection with another user", function() {
        test("u1 and u2 connect. Then u2 removes connection", async function() {
            try {

                let response = await request(app)
                    .post(`/users/connect/${u2.userUuId}`)
                    .set('Authorization', `Bearer ${token1}`);
                expect(response.status).toEqual(200);
                response = await request(app)
                    .post(`/users/connect/${u1.userUuId}`)
                    .set('Authorization', `Bearer ${token2}`);
                expect(response.status).toEqual(200);
                response = await request(app)
                    .delete(`/users/connect/${u1.userUuId}`)
                    .set('Authorization', `Bearer ${token2}`);
                expect(response.status).toEqual(200);
                let connection = await UserUserJoins.checkIfConnected(u1.userUuId, u2.userUuId);
                expect(connection).toEqual(false);
            } catch (err) {
                console.log(err);
            }
        });
    });

    afterAll(async function() {
        //await db.sequelize.close();
    });
});