// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
var Auth0Strategy = require('passport-auth0');

var User            = require('../models/user.js');


// load the auth variables
// var configAuth = require('./auth'); // use this one for testing

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(data, done) {
        done(null, data.id);
        // done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, data) {
            done(err, data);
        });
         // done(null, user);
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        console.log("passport signup");
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        console.log("req body in passport - " + req.body);
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'data.email' :  email }, function(err, data) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (data) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {
                        
                        // if there is no user with that email
                        // create the user
                        var newUser = new User();
                        // set the user's local credentials
                        newUser.data.email    = email;
                        newUser.data.password = newUser.generateHash(password);
                        newUser.data.firstName = req.body.firstName;
                        newUser.data.lastName = req.body.lastName;
                        newUser.data.hasUpdatedProfile = false;
                        // save the user
                        newUser.save(function(err) {
                            if (err)
                                return done(err, null);

                            console.log("new user added successfully.");
                            return done(null, newUser);
                        });
            }

        });    

        });
    }));


	passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        console.log("passport signin");
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'data.email' :  email }, function(err, data) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!data){
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            }

            if(data && !data.data.password){
                return done(null, false, req.flash('loginMessage', 'No Password set.')); // req.flash is the way to set flashdata using connect-flash
            }

            // if the user is found but the password is wrong
            if (!data.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
           
            // all is well, return successful user
            return done(null, data);
        });

    }));

    // var strategy = new Auth0Strategy({
    //     domain:       process.env.AUTH0_DOMAIN,
    //     clientID:     process.env.AUTH0_CLIENT_ID,
    //     clientSecret: process.env.AUTH0_CLIENT_SECRET,
    //     callbackURL:  process.env.AUTH0_CALLBACK_URL || 'http://localhost:8000/callback'
    //   }, function(accessToken, refreshToken, extraParams, profile, done) {
    //     // accessToken is the token to call Auth0 API (not needed in the most cases)
    //     // extraParams.id_token has the JSON Web Token
    //     // profile has all the information from the user
    //     return done(null, profile);
    //   });

    // passport.use(strategy);

    // var webAuth = new auth0.WebAuth({
    //     domain:       'badri91.auth0.com',
    //     clientID:     'FZ7VX1szNu6GckL-hU7mOSjkiKpSPPC3'
    // });

    // // Trigger login with google
    // webAuth.authorize({
    //     connection: 'google-oauth2'
    // });

    //   // Trigger login with github
    // webAuth.authorize({
    //     connection: 'github'
    // });

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    // passport.use(new GoogleStrategy({

    //     clientID        : configAuth.googleAuth.clientID,
    //     clientSecret    : configAuth.googleAuth.clientSecret,
    //     callbackURL     : configAuth.googleAuth.callbackURL,
    //     passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    // },
    // function(req, token, refreshToken, profile, done) {

    //     // asynchronous
    //     process.nextTick(function() {

    //         // check if the user is already logged in
    //         if (!req.user) {

    //             User.findOne({ 'data.email' : (profile.emails[0].value || '').toLowerCase() }, function(err, user) {
    //                 if (err)
    //                     return done(err);

    //                 else{
    //                     console.log("refresh token - "+ refreshToken);
    //                     if (user) {
    //                         user.data.refreshToken = refreshToken;
    //                         user.data.token = token;

    //                         user.save(function(err) {
    //                             if (err)
    //                                 return done(err);
    //                             else   
    //                                 return done(null, user);
    //                         });
    //                     } else {

    //                                 console.log("new tester added successfully - " + (profile.emails[0].value || '').toLowerCase());
    //                                 var newUser          = new User();
    //                                 newUser.data.refreshToken = refreshToken;
    //                                 newUser.data.token = token;
    //                                 newUser.data.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

    //                                 newUser.save(function(err) {
    //                                     if (err)
    //                                         return done(err);
    //                                     else{
    //                                         console.log("new user added successfully - " + (profile.emails[0].value || '').toLowerCase());
    //                                         return done(null, newUser);
    //                                     }
    //                                 });

    //                     }
    //                 }
    //             });

    //         } else {
    //             // user already exists and is logged in, we have to link accounts
    //             var user               = req.user; // pull the user out of the session
    //             user.data.refreshToken = refreshToken;
    //             user.data.token = token;
    //             // user.data.name  = profile.displayName;
    //             user.data.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

    //             user.save(function(err) {
    //                 if (err)
    //                     return done(err);
    //                 else   
    //                     return done(null, user);
    //             });
    //         }
    //     });
    // }));

};