const Sequelize = require('sequelize');
const User = require('../models').User;
const Op = require('../models/').Sequelize.Op;
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config/config.js");

const createUser = async function(user) {
    if (user.password) {
        user.passwordHash = await bcrypt.hash(user.password, BCRYPT_WORK_FACTOR);
        delete user.password;
    } else {
        console.log('No Password provided');
        return false;
    }
    return User
        .create(user)
        .then((result) => {
            let userResult = result.get({ plain: true });
            delete userResult.passwordHash;
            return userResult;
        })
        .catch(error => {
            console.log(error, 'There was an error in the create');
        });
}
const getUser = async function(filter, authenticate = false) {
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
    const attributesclause = ['email', 'userName', 'isAdmin',
        'disabled', 'userUuId'
    ]
    if (authenticate) { attributesclause.push('passwordHash'); }
    return User
        .findAll({
            where: whereclause,
            raw: true,
            attributes: attributesclause,
        })
        .then((result) => {
            return result;
        })
        .catch(error => {
            console.log(error, 'There was an error in the get');
        });
}
const updateUser = async function(user) {
    let whereclause = {};
    if (user.password) {
        user.passwordHash = await bcrypt.hash(user.password, BCRYPT_WORK_FACTOR);
        delete user.password;
    }
    whereclause.userId = user.userId;
    return User
        .update(
            user, {
                returning: ['email', 'userName', 'isAdmin',
                    'disabled', 'userUuId'
                ],
                raw: true,
                where: whereclause
            }
        )
        .then((result) => {
            console.log('User updated');
            return result;
        })
        .catch(error => {
            console.log(error, 'There was an error updating this user');
        });
}
const authenticateUser = async function(userName, password) {
    try {
        const user = await this.getUser({ userName: userName }, true);
        if (user[0] && user[0].passwordHash) {
            const valid = await bcrypt.compare(password, user[0].passwordHash);
            delete user[0].passwordHash;
            if (valid === true) {
                return user[0];
            }
        }
        console.log("There was a problem with comparing the password hash");
        return false;

    } catch (error) {
        console.log(error, 'There was an error authenticating the user');
        return false;
    }
}
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
        });

    return results;
}
module.exports = {
    createUser,
    getUser,
    updateUser,
    authenticateUser,
    disableUser
}