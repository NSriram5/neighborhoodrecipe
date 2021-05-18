const Sequelize = require('sequelize');
const User = require('../models').User;
const UserUserJoins = require('./userUserJoins');
const Op = require('../models/').Sequelize.Op;
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config/config.js");
const { BadRequestError, ExpressError } = require("../expressError");

const allAttributes = ['email', 'userName', 'isAdmin',
    'disabled', 'userUuId', 'wantsNutritionData', 'privacySetting'
]

/**
 * Creates a user 
 * @param {Object} user an object representing the user to be stored in database
 * @returns the user object if successful
 */
const createUser = async function(user) {
    if (user.password) {
        user.passwordHash = await bcrypt.hash(user.password, BCRYPT_WORK_FACTOR);
        delete user.password;
    } else {
        console.log('No Password provided');
        return false;
    }
    let userNameSearch = await this.getUsers({ userName: user.userName });
    if (userNameSearch.length > 0) {
        throw new BadRequestError("Username already taken");
    }
    return User
        .create(user)
        .then((result) => {
            let userResult = result.get({ plain: true });
            delete userResult.passwordHash;
            return userResult;
        })
        .catch(error => {
            throw new ExpressError(error, 400);
        });
}

/**
 * Gets a list of users specified by a filter
 * @param {Object} filter the parameters of a filter 
 * @param {Boolean} authenticate (Optional) if this get request is being used to authenticate a user. Defaults to false
 * @returns {Object} A list of users specified
 */
const getUsers = async function(filter, authenticate = false) {
    let whereclause
    whereclause = {};
    if (filter == undefined) { filter = {}; }
    if (filter.email) {
        whereclause.email = {
            [Op.eq]: filter.email
        };
    }
    if (filter.userName) {
        whereclause.userName = {
            [Op.eq]: filter.userName
        };
    }
    if (filter.userUuId) {
        whereclause.userUuId = {
            [Op.eq]: filter.userUuId
        };
    }
    const attributesclause = allAttributes
    if (authenticate) { attributesclause.push('passwordHash'); }
    return User
        .findAll({
            where: whereclause,
            //raw: true,
            attributes: attributesclause,
        })
        .then((result) => {
            return result;
        })
        .catch(error => {
            throw new ExpressError(error, 400);
        });
}

/**
 * Updates a user given a user object containing the user's UuId
 * @param {Object} user 
 * @returns {Object} updated user on success
 */
const updateUser = async function(user) {
    let whereclause = {};
    if (user.password) {
        user.passwordHash = await bcrypt.hash(user.password, BCRYPT_WORK_FACTOR);
        delete user.password;
    }
    whereclause.userUuId = user.userUuId;
    return User
        .update(
            user, {
                returning: allAttributes,
                raw: true,
                where: whereclause
            }
        )
        .then((result) => {
            console.log('User updated');
            return result[1][0];
        })
        .catch(error => {
            throw new ExpressError(error, 400);
        });
}

/**
 * Takes the username and password and returns the first user that matches the first username that 
 * agrees with the password.
 * @param {String} userName 
 * @param {String} password 
 * @returns {Boolean} success of the authentication attempt
 */
const authenticateUser = async function(userName, password) {
    try {
        const users = await this.getUsers({ userName: userName }, true);
        for (user of users) {
            let userDataValues = user.dataValues;
            if (user && user.passwordHash) {
                const valid = await bcrypt.compare(password, user.passwordHash);
                delete userDataValues.passwordHash;
                if (valid === true) {
                    return userDataValues;
                }
            }
        }
        console.log("There was a problem with comparing the password hash");
        return false;

    } catch (error) {
        console.log(error, 'There was an error authenticating the user');
        return false;
    }
};

const inviteUser = async function(selfUserUuId, targetUserUuid) {
    try {
        return UserUserJoins
            .newConnectionRequest(targetUserUuid, selfUserUuId)
            .then((result) => {
                return result;
            });
    } catch (error) {
        throw new ExpressError(error, 400);
    };
};

const acceptUser = async function(selfUserUuId, requestorUuId) {
    try {
        return UserUserJoins
            .acceptConnection(selfUserUuId, requestorUuId)
            .then((result) => {
                return result;
            });
    } catch (error) {
        throw new ExpressError(error, 400);
    };
};

const getConnections = async function(selfUserUuId) {
    try {
        let connections = await UserUserJoins.getUserUserConnections({ userUuId: selfUserUuId });
        console.log(connections);
        return connections;
    } catch (error) {
        throw new ExpressError(error, 400);
    }
}

const removeConnection = async function(selfUserUuId, targetUuId) {
    try {
        let connections = await UserUserJoins.removeConnection(selfUserUuId, targetUuId);
        return { message: "Connection removed successfully" };
    } catch (error) {
        //console.log(error);
        throw new ExpressError(error, 400);
    }
}

/**
 * Deletes the selected user
 * @param {String} userUuId the user's UuId 
 * @returns {Object} 
 */
const disableUser = async function(userUuId) {
    let whereclause = {};
    whereclause.userUuId = userUuId;
    return User
        .update({ disabled: true }, {
            returning: true,
            where: whereclause,
            raw: true
        })
        .then((result) => {
            console.log('User disabled');

            return result;
        })
        .catch(error => {
            console.log(error, 'There was an error with disabling this user');
            throw new ExpressError(error, 400);
        });
};


module.exports = {
    createUser,
    getUsers,
    updateUser,
    authenticateUser,
    disableUser,
    inviteUser,
    acceptUser,
    getConnections,
    removeConnection
}