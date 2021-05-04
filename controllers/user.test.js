const app = require("../app");
const db = require("../models/index");
const User = require("../controllers/user");
const UserUserJoin = require("./userUserJoins");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config/config.js");

describe("Test all user controller functions", function() {
    let passwordHash;
    let userUuId = '40e6215d-b5c6-4896-987c-f30f3678f607';
    let uuId1, uuId2;

    beforeAll(async function() {
        passwordHash = await bcrypt.hash("test", BCRYPT_WORK_FACTOR);
        await db.sequelize.sync({ force: true }).then(() => {
                console.log('Database connection has been established.');
            })
            .catch((err) => {
                console.error("Unable to connect to the database", err);
            });
    });
    beforeEach(async function() {
        try {
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
            uuId1 = u1.userUuId;
            uuId2 = u2.userUuId;
            //console.log(u1);
        } catch (err) {
            //console.log(err);
        }
    });

    /**
     * Use the controller to look for an existing user
     */
    describe("Get user", function() {
        test("Can get a user that exists", async function() {
            const found = await User.getUsers({ uuId1 });
            expect(found[0]).toEqual(expect.objectContaining({ userName: "Test1", email: "asdf@asdf.com" }));
        });
    });

    /**
     * Use the controller to create a new user
     */
    describe("Make user", function() {
        test("Can make a user, then get that user", async function() {
            const u3 = await User.createUser({
                email: "createdUserforTest@gmail.com",
                password: "ThisIsAPassword!3",
                userName: "GoopyHoopy",
                isAdmin: true
            });
            let found = await User.getUsers({
                email: "createdUserforTest@gmail.com"
            });
            expect(found[0]).toEqual(expect.objectContaining({ userName: "GoopyHoopy" }));
            found = null;
            found = await User.getUsers({
                userName: "GoopyHoopy"
            });
            expect(found[0]).toEqual(expect.objectContaining({ email: "createdUserforTest@gmail.com" }));
        })
    });

    /**
     * Use the controller to connect two users as connections
     */
    describe("Initiate connection", function() {
        test("u1 tries to make a connection with u2", async function() {
            await User.inviteUser(uuId1, uuId2);
            let found = await UserUserJoin.getPendingIncConnections(uuId2);
            expect(found[0]).toEqual(expect.objectContaining({ requestorUuId: uuId1, targetUuId: uuId2, accepted: false }));
            found = null;
            found = await UserUserJoin.getPendingOutConnections(uuId1);
            expect(found[0]).toEqual(expect.objectContaining({ requestorUuId: uuId1, targetUuId: uuId2, accepted: false }));
            await User.acceptUser(uuId2, uuId1);
            found = null;
            found = await UserUserJoin.getUserUserConnections
        })
    });

    /**
     * Use controller to look up all of a user's connections
     */
    describe("Lookup connections", function() {
        test("u1 makes connection with both u2 and a u3", async function() {
            const u3 = await User.createUser({
                email: "createdUserforTest@gmail.com",
                password: "ThisIsAPassword!3",
                userName: "GoopyHoopy",
                isAdmin: true
            });
            let p1 = User.inviteUser(uuId1, uuId2);
            let p2 = User.inviteUser(uuId1, u3.userUuId);
            await Promise.all([p1, p2]);
            p1 = User.acceptUser(uuId2, uuId1);
            p2 = User.acceptUser(u3.userUuId, uuId1);
            await Promise.all([p1, p2]);
            let found1 = User.getConnections(uuId2);
            let found2 = User.getConnections(uuId1);
            [found1, found2] = await Promise.all([found1, found2]);
            expect(found1).toContainEqual(expect.objectContaining({ requestorUuId: uuId1 }));
            expect(found2).toContainEqual(expect.objectContaining({ targetUuId: u3.userUuId }));
            expect(found2).toContainEqual(expect.objectContaining({ targetUuId: uuId2 }));
        })
    });

    /**
     * Use controller to remove an existing connection between two users
     */
    describe("Remove connections", function() {
        test("u1 makes connection with u2 and then the connection is removed", async function() {
            let p1 = await User.inviteUser(uuId1, uuId2);
            let p2 = await User.acceptUser(uuId2, uuId1);
            let found1 = await User.getConnections(uuId1);
            expect(found1[0]).toEqual(expect.objectContaining({ requestorUuId: uuId1 }));
            let p3 = await User.removeConnection(uuId1, uuId2);
            found1 = await User.getConnections(uuId1);
            expect(found1.length).toEqual(0);
        });
    });
    afterAll(async function() {
        await db.sequelize.close();
    });
});