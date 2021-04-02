const user = require('./controllers/user');
const fs = require('fs');
const index = require('./models/index');
const app = require("./app");
const { configuration } = require('./config/config');
if (configuration.environmentOptions.environment == "LOCAL") {
    console.log("I'm in a local environment");
    let forceOption = { force: true };
}
if (configuration.environmentOptions.environment == "AWS") {
    console.log("I'm in an AWS cloud environment");
}

app.listen(3000, function() {
    console.log("listening on 3000");
})