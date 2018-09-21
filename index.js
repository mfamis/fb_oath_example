// This authorization code has been used
// Could be due to not calling done/callback in facebook callback (fbCallback)
// https://github.com/jaredhanson/passport/issues/108

// passport.initialize() middleware not in use
// https://stackoverflow.com/questions/16781294/passport-js-passport-initialize-middleware-not-in-use

// failed to serialize user into session
// https://stackoverflow.com/questions/19948816/error-failed-to-serialize-user-into-session

// req.logout does not actually log you out
// https://stackoverflow.com/questions/13758207/why-is-passportjs-in-node-not-removing-session-on-logout

var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var passport = require("passport");
var FacebookStrategy = require("passport-facebook");

require("dotenv").config();

var app = express();
app.use(bodyParser.json());
app.use(session({
    secret: "mfamis",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

var fbConfig = {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/facebook/callback"
};

var fbCallback = function(accessToken, refreshToken, profile, done) {
    console.log(`accessToken: ${accessToken}`);
    console.log(`refreshToken: ${refreshToken}`);
    console.log(`profile: ${JSON.stringify(profile)}`);
    done(null, profile);
};

passport.use(new FacebookStrategy(fbConfig, fbCallback));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.get("/", function(req, res) {
    console.log(req);
    console.log(req.user);
    let html = "<html><head></head><body>";
    if (req.isAuthenticated()) {
        html += "<a href='/profile'>Go to profile</a><br />";
        html += "<a href='/logout'>Log out</a>";
    } else {
        html += "<a href='/login/facebook'>Facebook log in</a>";
    }
    html += "</body></html>";
    res.send(html);
});

app.route("/login/facebook").get(
    passport.authenticate("facebook")
);

app.route("/auth/facebook/callback").get(
    passport.authenticate("facebook", {
        successRedirect : '/profile',
        failureRedirect : '/'
    })
);

/*
app.get("/photo", function(req, res) {
    if (req.isAuthenticated()) {
        if (req.user.provider === "facebook") {

        }
        else {

        }
    }

    res.send(false);
});
*/

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

app.get("/profile", isLoggedIn, function(req, res) {
    console.log(req);
    console.log(req.user);
    res.send(req.user.id + ": " + req.user.displayName);
});

app.get('/logout', function(req, res) {
    req.session.destroy(function (err) {
        res.redirect('/'); //Inside a callback… bulletproof!
    });
});

app.listen(8080);