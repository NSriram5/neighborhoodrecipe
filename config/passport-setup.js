const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
require("dotenv").config();

passport.use(
    new GoogleStrategy({
        callbackURL: '/auth/google/redirect',
        clientID: process.env.GOOGLECLIENTID,
        clientSecret: process.env.GOOGLESECRETKEY
    }, () => {

    })
)