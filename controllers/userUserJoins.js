const userUserJoins = require('../models').userUserJoins;
const userModel = require('../models').User;
const Op = require('../models').Sequelize.Op;
const { BadRequestError, ExpressError, NotFoundError } = require("../expressError");

function checkInputSelfTarget(selfUuId, targetUuId) {
    if (targetUuId == undefined) {
        throw new ExpressError('A targetUuId must be provided', 400);
    }
    if (selfUuId == undefined) {
        throw new ExpressError('A selfUuId must be provided', 400);
    }
}

const getUserUserConnections = async function(filter) {
    console.log(filter.userUuId);
    if (filter == undefined) {
        return { error: 'You must submit filter criteria' };
    }
    let whereclause = {};
    if (filter.userUuId) {
        whereclause = {
            [Op.or]: [{
                    requestorUuId: {
                        [Op.eq]: filter.userUuId
                    }
                },
                {
                    targetUuId: {
                        [Op.eq]: filter.userUuId
                    }
                }
            ]
        };
    } else {
        if (filter.requestorUuId) {
            whereclause.requestorUuId = {
                [Op.eq]: filter.requestorUuId
            };
        }
        if (filter.targetUuId) {
            whereclause.targetUuId = {
                [Op.eq]: filter.targetUuId
            };
        }
    }
    console.log(whereclause);
    return userUserJoins.findAll({
        where: whereclause,
        returning: ['id', 'accepted', 'requestorUuId', 'targetUuId'],
        include: [{
            association: 'requestor',
            attributes: ['email', 'userUuId', 'userName']
        }, {
            association: 'target',
            attributes: ['email', 'userUuId', 'userName']
        }],
        nest: true,
        raw: true
    }).catch((error) => {
        console.log(error);
        return error;
    })
};

const checkIfConnected = async function(selfUuId, targetUuId) {
    checkInputSelfTarget(selfUuId, targetUuId);
    let whereclause = {
        [Op.or]: [{
                [Op.and]: [{
                        requestorUuId: {
                            [Op.eq]: selfUuId
                        }
                    },
                    {
                        targetUuId: {
                            [Op.eq]: targetUuId
                        }
                    }
                ]
            },
            {
                [Op.and]: [{
                        targetUuId: {
                            [Op.eq]: selfUuId
                        }
                    },
                    {
                        requestorUuId: {
                            [Op.eq]: targetUuId
                        }
                    }
                ]
            }
        ]
    };
    return userUserJoins.findOne({ where: whereclause })
        .then((result) => {
            if (!result) {
                console.log(`Searching for user connections produced: ${result}, when selfUuId ${selfUuId}. when targetUuId ${targetUuId}`);
                return false;
            }
            return result;
        })
        .catch((err) => {
            console.log(`An error has occured while trying to check if users were connected ${err}`);
            throw err;
        });
}

const getPendingIncConnections = async function(targetUuId) {
    if (targetUuId == undefined) {
        throw new ExpressError('A targetUuId must be provided', 400);
    }
    let whereclause = {
        targetUuId: {
            [Op.eq]: targetUuId
        },
        accepted: {
            [Op.eq]: false
        }

    };
    return userUserJoins.findAll({
        where: whereclause,
        returning: ['id', 'accepted', 'requestorUuId', 'targetUuId'],
        //raw: true
    }).catch((error) => {
        console.log(error);
        return error;
    })
}
const getPendingOutConnections = async function(requestorUuId) {
    if (requestorUuId == undefined) {
        return { error: 'A requestorUuId must be provided' };
    }
    let whereclause = {
        requestorUuId: {
            [Op.eq]: requestorUuId
        },
        accepted: {
            [Op.eq]: false
        }

    };
    return userUserJoins.findAll({
        where: whereclause,
        returning: ['id', 'accepted', 'requestorUuId', 'targetUuId'],
        //raw: true
    }).catch((error) => {
        console.log(error);
        return error;
    })
}

const acceptConnection = async function(selfUuId, targetUuId) {
    checkInputSelfTarget(selfUuId, targetUuId);
    let whereclause = {
        targetUuId: {
            [Op.eq]: selfUuId
        },
        requestorUuId: {
            [Op.eq]: targetUuId
        }
    }
    let change = { accepted: true };
    let found = await userUserJoins.findOne({ where: whereclause });
    return found.update(change)
        .then((result) => {
            if (result.length == 0) throw new ExpressError("no records updated", 404);
            return result;
        })
        .catch((err) => {
            return err;
        });

}

const newConnectionRequest = async function(targetUuId, selfUuId) {
    if (targetUuId == undefined || selfUuId == undefined) {
        console.log("Either a targetUuId or a selfUuId was not provided");
        throw new BadRequestError(`targetUuId: ${targetUuId} or selfUuId: ${selfUuId} is not defined`);
    }
    const response = await checkIfConnected(selfUuId, targetUuId);
    if (response) throw new BadRequestError("Connection already exists");
    return userUserJoins.create({ targetUuId, requestorUuId: selfUuId })
        .then((result) => {
            return result
        })
        .catch((err) => {
            return err;
        });
}

const removeConnection = async function(targetUuId, selfUuId) {
    const response = await checkIfConnected(selfUuId, targetUuId);
    if (!response) throw new NotFoundError("Connection not found")
    await userUserJoins.destroy({
        where: { id: response.id }
    });
    return { message: "connection between users removed successfully" };
}

module.exports = {
    getUserUserConnections,
    getPendingIncConnections,
    getPendingOutConnections,
    checkIfConnected,
    newConnectionRequest,
    acceptConnection,
    removeConnection
};