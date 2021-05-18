const {
    bethsSoupBroth,
    chickenSalad,
    rasam,
    humus,
    moroccanlentilsoup,
    testUser1,
    testUser2,
    testUser3,
    testUser4,
    testUser5
} = require("./testData");
const Recipe = require('../controllers/recipe');
const User = require('../controllers/user');

async function seed() {
    const [u1, u2] = await Promise.all([User.createUser(testUser1), User.createUser(testUser2)]);
    const [u3, u4] = await Promise.all([
        User.createUser(testUser3),
        User.createUser(testUser4)
    ]);

    const u5 = await User.createUser(testUser5);
    console.log(u1);
    console.log(u2);
    bethsSoupBroth.userUuId = u1.userUuId;
    chickenSalad.userUuId = u1.userUuId;
    rasam.userUuId = u2.userUuId;
    humus.userUuId = u2.userUuId;
    moroccanlentilsoup.userUuId = u1.userUuId;
    const r1 = await Recipe.createRecipe(bethsSoupBroth);
    const r2 = await Recipe.createRecipe(chickenSalad);
    const r3 = await Recipe.createRecipe(rasam);
    const r4 = await Recipe.createRecipe(humus);
    const r5 = await Recipe.createRecipe(moroccanlentilsoup);

    console.log(r1);
    console.log(r2);
    console.log(r3);
    console.log(r4);
    console.log(r5);

    await User.inviteUser(u1.userUuId, u2.userUuId);
    await User.acceptUser(u2.userUuId, u1.userUuId);
    await User.inviteUser(u1.userUuId, u3.userUuId);
    await User.inviteUser(u4.userUuId, u1.userUuId);
}

module.exports = { seed };