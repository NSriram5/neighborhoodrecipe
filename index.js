const user = require('./controllers/user');
const fs = require('fs');
const db = require('./models/index');
const app = require("./app");
const { seed } = require("./seeding/seeding");
const { configuration } = require('./config/config');
let port = 3001;
if (configuration.environmentOptions.environment == "LOCAL") {
    console.log("I'm in a local environment");
    let forceOption = { force: true };
    //forceOption = {};
    db.sequelize.sync(forceOption)
        .then(() => {
            console.log('Connection has been established successfully.');
            seed();
        })
        .catch((err) => { console.error('Unable to connect to the database:', err); });

}
if (configuration.environmentOptions.environment == "AWS") {
    port = 8080;
    let forceOption = { force: true };
    console.log("I'm in an AWS cloud environment");
    db.sequelize.sync(forceOption)
        .then(() => {
            console.log('Connection has been established successfully.');
        })
        .catch((err) => { console.error('Unable to connect to the database:', err); })
}

app.listen(port, function() {
    console.log(`listening on ${port}`);
})