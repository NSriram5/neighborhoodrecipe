const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require('../models/index');
const User = require('../controllers/user');

describe("Auth Routes Test", function() {
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
    });

    /**
     * Post /auth/register
     * return token
     */
    describe("POST /auth/register", function() {
        test("can register", async function() {
            let response = await request(app)
                .post("/auth/register")
                .send({
                    email: "blackhawk@birthday.com",
                    password: "secret",
                    userName: "George Gregory"
                });
            let token = response.body.token;
            expect(jwt.decode(token)).toEqual({ iat: expect.any(Number), userUuId: expect.any(String), userName: "George Gregory", isAdmin: false })
        });
    });

    /**
     * POST /auth/token
     * returns token
     */
    describe("POST /auth/token", function() {
        test("can login", async function() {
            console.log("starting login test1");
            let response = await request(app)
                .post("/auth/token")
                .send({ userName: "Test1", password: "password" });
            let token = response.body.token;
            expect(jwt.decode(token)).toEqual({
                iat: expect.any(Number),
                userUuId: expect.any(String),
                userName: "Test1",
                isAdmin: false
            });
        });
        test("can login admin", async function() {
            console.log("starting login test2");
            let response = await request(app)
                .post("/auth/token")
                .send({ userName: "Test2", password: "badpassword" });
            let token = response.body.token;
            expect(jwt.decode(token)).toEqual({
                iat: expect.any(Number),
                userUuId: expect.any(String),
                userName: "Test2",
                isAdmin: true
            });
        });
        test("can't login bad password", async function() {
            let response = await request(app)
                .post("/auth/token")
                .send({ userName: "Test1", password: "badpassword" });
            let token = response.body.token;
            expect(response.statusCode).toEqual(400);
        });
        test("can't login bad username", async function() {
            try {
                let response = await request(app)
                    .post("/auth/token")
                    .send({ userName: "Rabbit", password: "password" });
                let token = response.body.token;
            } catch (err) {
                expect(err).toEqual(400);
            }
        });
    });
    afterAll(async function() {
        await db.sequelize.close();
    })
});