const user = require('./controllers/user');
const fs = require('fs');
const db = require('./models/index');
const app = require("./app");
const { configuration } = require('./config/config');
if (configuration.environmentOptions.environment == "LOCAL") {
    console.log("I'm in a local environment");
    let forceOption = { force: true };
    db.sequelize.sync(forceOption)
        .then(() => { console.log('Connection has been established successfully.'); })
        .catch((err) => { console.error('Unable to connect to the database:', err); });
}
if (configuration.environmentOptions.environment == "AWS") {
    console.log("I'm in an AWS cloud environment");
}

app.listen(3001, function() {
    console.log("listening on 3001");
})