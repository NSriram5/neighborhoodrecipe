const {
    bethsSoupBroth,
    chickenSalad,
    rasam,
    humus,
    testUser1,
    testUser2,
} = require("./testData");
const Recipe = require('../controllers/recipe');
const User = require('../controllers/user');

async function seed() {
    const [u1, u2] = await Promise.all([User.createUser(testUser1), User.createUser(testUser2)]);
    console.log(u1);
    console.log(u2);
    bethsSoupBroth.userUuId = u1.userUuId;
    chickenSalad.userUuId = u1.userUuId;
    rasam.userUuId = u2.userUuId;
    humus.userUuId = u2.userUuId;
    const [r1, r2, r3] = await Promise.all([
        Recipe.createRecipe(bethsSoupBroth),
        Recipe.createRecipe(chickenSalad),
        Recipe.createRecipe(rasam),
    ]);
    const r4 = await Recipe.createRecipe(humus);
    console.log(r1);
    console.log(r2);
    console.log(r3);
    console.log(r4);
}

module.exports = { seed };