const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");

/** return signed JWT from user data. */

function createToken(user) {
    console.assert(user.isAdmin !== undefined,
        "createToken passed user without isAdmin property");

    let payload = {
        userName: user.userName,
        userUuId: user.userUuId,
        isAdmin: user.isAdmin || false,
    };
    let token = jwt.sign(payload, SECRET_KEY);
    let check
    try {
        check = jwt.verify(token, SECRET_KEY);
    } catch (err) {
        console.log(`An error has occured during signing ${err}`)
    }
    return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };