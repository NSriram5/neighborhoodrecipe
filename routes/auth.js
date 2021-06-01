"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");

const User = require("../controllers/user");
const express = require("express");
const router = new express.Router();
const bcrypt = require("bcrypt");
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError, UnauthorizedError, ExpressError } = require("../expressError");
const { OAuth2Client } = require('google-auth-library');
const { GOOGLE_CLIENT_ID } = require("../config/config");
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const { DEFAULT_USER_PW } = require('../config/config');
const { BCRYPT_WORK_FACTOR } = require("../config/config");

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userAuthSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            return res.json({ invalidMessage: errs })
        }
        const { userName, password } = req.body;
        const valid = await User.authenticateUser(userName, password);
        if (!valid) {
            throw new ExpressError("Invalid userName or password", 400);
        }
        delete valid.passwordHash;
        const token = createToken(valid);
        return res.status(201).json({ token, user: valid });
    } catch (err) {
        //console.log(err);
        return next(err);
    }
});

/** 
 * 
 */
router.post('/google', async function(req, res, next) {
    try {
        console.log("Beginning token validation");
        const ticket = await client.verifyIdToken({
            idToken: req.body.tokenId,
            audience: GOOGLE_CLIENT_ID
        });
        //console.log(ticket);
        const providedEmail = ticket.getPayload().email.toLowerCase();
        const providedName = ticket.getPayload().given_name;
        const userID = ticket.getPayload().sub;
        const found = await User.getGoogleUser(userID);
        if (found != undefined) {
            const token = createToken(found);
            return res.status(201).json({ token, user: found });
        }
        const newUser = {
            userName: providedName,
            email: providedEmail,
            googleUser: true,
            googleId: userID,
            password: DEFAULT_USER_PW
        }
        const googleUser = await User.createUser(newUser);
        const found2nd = await User.getGoogleUser(userID);
        if (found2nd == undefined) {
            throw new ExpressError("I tried to create a new google user after failing to find one, but I still can't find the user");
        }
        const token = createToken(found2nd);
        return res.status(201).json({ token, user: found2nd });

        console.log(`${found}`);
    } catch (err) {
        return next(err);
    }
})

// router.get('/google/redirect')

// router.get('/google/')

/** POST /auth/login - login: { username, password } => { token }
 *  
 *  users that supply the correct username and password pairing will be granted a token
 */
// router.post("/login", async function(req, res, next) {
//     try {
//         const { userName, password } = req.body;
//         console.log(`Trying to log in as ${userName}`);
//         const token = await User.authenticateUser(userName, password);
//         if (token) {
//             console.log("logged in");
//             req.session.token = token;
//             return res.json({ token });
//         }
//         throw new ExpressError("Invalid username/password", 400);
//     } catch (e) {
//         console.log(e);
//         next(e);
//     }
// })


/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userRegisterSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const userName = req.body.userName;
        const userPassword = req.body.password;
        const newUser = await User.createUser(req.body);
        const valid = await User.authenticateUser(userName, userPassword);
        delete valid.passwordHash;
        const token = createToken(valid);
        console.log(`New token created and it's ${token}`);

        return res.status(201).json({ token, user: valid });
    } catch (err) {
        console.log(`The process has thrown an error: ${err}`);
        return next();
    }
});


module.exports = router;