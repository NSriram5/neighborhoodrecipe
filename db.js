/** Database connection for messagely. */


const { Sequelize } = require("sequelize");
const { DB_URI } = require("./config");

const client = new Client(DB_URI);

client.connect();


module.exports = client;