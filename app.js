"use strict";

const express = require("express");
const session = require("express-session")
const cors = require("cors");
const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
//const usersRoutes = require("./routes/users");
//const recipesRoutes = require("./routes/recipes");
//const ingredientsRoutes = require("./routes/ingredients");
//const { getUser } = require("./controllers/user");
const user = require("./controllers/user");
const path = require("path");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { SESSION_SECRET } = require("./config/config");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static(path.resolve(__dirname + "/../static")));
app.use(session({ secret: SESSION_SECRET }))
app.use(authenticateJWT);
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/auth", authRoutes);
//app.use("/users", usersRoutes);
//app.use("/recipes", recipesRoutes);
//app.use("/ingredients", ingredientsRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function(req, res, next) {

    return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function(err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message || "no message has been provided on this error";

    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app;