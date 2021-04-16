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
        const token = createToken(valid);
        req.session.token = token;
        return res.status(201).json({ token });
    } catch (err) {
        //console.log(err);
        return next(err);
    }
});

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
        await User.createUser(req.body);

        const valid = await User.authenticateUser(userName, userPassword);
        if (!valid) {
            return res.json({ invalidMessage: "User email or password is incorrect" })
        }
        const token = createToken(valid);
        req.session.token = token;
        return res.status(201).json({ token });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;