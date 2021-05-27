const { Sequelize } = require('sequelize');
const config = require('../config/config.js');
const path = require('path');
const fs = require('fs');
const basename = path.basename(__filename);
const db = {};

let sequelize;
if (config.configuration.environmentOptions.environment == "LOCAL") {
    sequelize = new Sequelize(
        config.configuration.local.databaseConfig.DATABASE_NAME,
        config.configuration.local.databaseConfig.DATABASE_USERNAME,
        config.configuration.local.databaseConfig.DATABSE_PASSWORD,
        config.configuration.local.databaseOptions
    );
}
if (config.configuration.environmentOptions.environment == "AWS") {
    console.log('Using an AWS database');
    console.log(`${config.configuration.aws.databaseOptions["host"]}`)
    sequelize = new Sequelize(
        config.configuration.aws.databaseConfig.DATABASE_NAME,
        config.configuration.aws.databaseConfig.DATABASE_USERNAME,
        config.configuration.aws.databaseConfig.DATABSE_PASSWORD,
        config.configuration.aws.databaseOptions
    );
}

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file != basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
})

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;