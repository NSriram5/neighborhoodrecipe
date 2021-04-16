"use strict";

/** Routes for user interactions. */

const jsonschema = require("jsonschema");
const userUpdateSchema = require("../schemas/userUpdate.json");
const User = require("../controllers/user");
const UserUserJoins = require("../controllers/userUserJoins");
const express = require("express");
const router = express.Router();
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const { BadRequestError, ForbiddenError, ExpressError } = require("../expressError");

/**
 * GET / => returns a list of users
 * 
 * Returns a list of users
 * 
 * Authorization required: login and admin
 */
router.get("/", ensureLoggedIn, ensureAdmin, async function(req, res, next) {
    try {
        const users = await User.getUsers({});
        return res.json({ users: users });
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

/**
 * GET /:userUuId => returns details about one specific user
 * 
 * Returns a json breakdown of user info
 * 
 * Authorization required: login of target user OR admin
 */
router.get("/:userUuId", ensureLoggedIn, async function(req, res, next) {
    try {
        const user = await User.getUsers({ userUuId: req.params.userUuId });
        if (res.locals.user.isAdmin == false && res.locals.user.userUuId != user[0].dataValues.userUuId) {
            throw new ForbiddenError("Only an admin or the user of this account can view these user details");
        }
        return res.json({ user: user[0] });

    } catch (err) {
        console.log(err);
        return next(err);
    }
});

/**
 * POST /connect/:userUuId => sends a connection request to another user
 * 
 * Returns a success message
 * 
 * Authorization required: login
 */
router.post("/connect/:userUuId", ensureLoggedIn, async function(req, res, next) {
    try {
        const selfUuId = res.locals.user.userUuId;
        const targetUuId = req.params.userUuId;
        const check = await UserUserJoins.checkIfConnected(selfUuId, targetUuId);
        if (!check) {
            const connect = await User.inviteUser(selfUuId, targetUuId);
            if (connect) return res.json({ message: "invite sent" });
        }
        if (check.dataValues.targetUuId == selfUuId && !check.dataValues.accepted) {
            const connect = await User.acceptUser(selfUuId, targetUuId);
            if (connect) return res.json({ message: "invite accepted" });
        }
        throw new BadRequestError("A connection request already exists");
    } catch (err) {
        return next(err);
    }
});

/**
 * DELETE /connect/:userUuId => sends a command to terminate this connection
 * 
 * Returns a success message
 * 
 * Authorization required: login
 */
router.delete("/connect/:userUuId", ensureLoggedIn, async function(req, res, next) {
    try {
        const selfUuId = res.locals.user.userUuId;
        const targetUuId = req.params.userUuId;
        const result = await User.removeConnection(selfUuId, targetUuId);
        return res.json(result);
    } catch (err) {
        return next(err);
    }
})



module.exports = router;