const app = require("../app");
const db = require("../models/index");
const User = require("./user");
const UserUserJoin = require("./userUserJoins");
const { testUser1, testUser2 } = require("../seeding/testData");

describe("Test all connection controller functions", function() {
    let uuId1, uuId2, uuId3, uuId4, uuId5;

    beforeAll(async function() {
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
            const testUser3 = {
                userName: "TestUser3",
                password: "password",
                email: "asdf3@asdf.com",
                wantsNutritionData: false,
                privacySetting: false
            };
            const testUser4 = {
                userName: "TestUser4",
                password: "password",
                email: "asdf4@asdf.com",
                wantsNutritionData: false,
                privacySetting: false
            };
            const testUser5 = {
                userName: "TestUser5",
                password: "password",
                email: "asdf5@asdf.com",
                wantsNutritionData: false,
                privacySetting: false
            };
            let u1 = await User.createUser({...testUser1 });
            let u2 = await User.createUser({...testUser2 });
            let u3 = await User.createUser({...testUser3 });
            let u4 = await User.createUser({...testUser4 });
            let u5 = await User.createUser({...testUser5 });
            uuId1 = u1.userUuId;
            uuId2 = u2.userUuId;
            uuId3 = u3.userUuId;
            uuId4 = u4.userUuId;
            uuId5 = u5.userUuId;
        } catch (err) {
            console.log(err)
        }
    }, 30000);

    describe("Make connection", function() {
        test("Can make a connection", async function() {
            let response = await UserUserJoin.newConnectionRequest(uuId1, uuId2);
            expect(response.dataValues).toEqual(expect.objectContaining({ targetUuId: uuId1, requestorUuId: uuId2, accepted: false }));
            response = await UserUserJoin.acceptConnection(uuId1, uuId2);
            expect(response.dataValues).toEqual(expect.objectContaining({ requestorUuId: uuId2, targetUuId: uuId1, accepted: true }));
            response = await UserUserJoin.getUserUserConnections({ userUuId: uuId1 });
            expect(response).toEqual(expect.arrayContaining([expect.objectContaining({ accepted: true, requestorUuId: uuId2, targetUuId: uuId1 })]));
        });

        test("Can make multiple connections then generate a report on the connections statuses", async function multipleConnectionTest() {
            try {
                let response = await UserUserJoin.newConnectionRequest(uuId1, uuId2);
                response = await UserUserJoin.acceptConnection(uuId1, uuId2);
                response = await UserUserJoin.newConnectionRequest(uuId3, uuId1);
                response = await UserUserJoin.acceptConnection(uuId3, uuId1);
                response = await UserUserJoin.newConnectionRequest(uuId4, uuId1);
                response = await UserUserJoin.newConnectionRequest(uuId1, uuId5);
            } catch (err) {
                console.log(err);
            }
            let response = await UserUserJoin.getUserUserConnections({ userUuId: uuId1 });
            //console.log(response);
            expect(response).toEqual(expect.arrayContaining([expect.objectContaining({ accepted: true, targetUuId: uuId1, requestorUuId: uuId2 })]));
            //expect(1).toEqual(2);
        });
    });

    afterAll(async function() {
        await db.sequelize.close();
    });
})