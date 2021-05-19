require("dotenv").config();



const configuration = {
    local: {
        databaseConfig: {
            DATABASE_USERNAME: 'artain',
            DATABSE_PASSWORD: '',
            DATABASE_NAME: 'neighborhoodrecipe',
            DATABSE_URL: '127.0.0.1',
            DATABASE_PORT: '5432'
        },
        databaseOptions: {
            "host": "127.0.0.1",
            "dialect": "postgres",
            "freezeTableName": true,
            "port": 5432,
            pool: {
                acquire: 600000
            },
            "logging": false
        }
    },
    aws: {
        databaseConfig: {
            DATABASE_USERNAME: process.env.DB_USERNAME || 'postgres',
            DATABSE_PASSWORD: process.env.DB_PASSWORD,
            DATABASE_NAME: process.env.DB_NAME,
            DATABSE_URL: process.env.DB_URL, //'neighborhoodRecipe-dev.cyfaiieqbmoj.us-west-2.rds.amazonaws.com',
            DATABASE_PORT: process.env.DB_PORT
        },
        databaseOptions: {
            "host": process.env.DB_HOST, //"neighborhoodRecipe-dev.cyfaiieqbmoj.us-west-2.rds.amazonaws.com",
            "dialect": "postgres",
            "freezeTableName": true,
            "port": process.env.DB_PORT,
            pool: {
                acquire: 600000
            },
            "logging": false
        }
    },
    environmentOptions: {
        environment: process.env.ENVIRONMENTNAME || "LOCAL",
    }
}
configuration.local.databaseConfig.DATABASE_NAME = (process.env.NODE_ENV === "test") ? "neighborhoodrecipetest" : "neighborhoodrecipe";

module.exports.configuration = configuration;
module.exports.BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;
module.exports.SECRET_KEY = process.env.SECRET_KEY || "test";
module.exports.SESSION_SECRET = process.env.SESSION_SECRET;
module.exports.EDAMAM_URL = process.env.EDAMAM_URL;
module.exports.EDAMAM_ID = process.env.EDAMAM_ID;
module.exports.EDAMAM_KEY = process.env.EDAMAM_KEY;