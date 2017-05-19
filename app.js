var express = require('express'), 
	mongoose = require('mongoose'),
	passport = require('passport'),
	ejs = require('ejs'),
	flash = require('connect-flash'),
	morgan = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	uuidV4 = require('uuid/v4'),
	path = require('path'),
	async = require('async');
	crypto = require('crypto');
	nodemailer = require('nodemailer'),
	smtpTransport = require("nodemailer-smtp-transport"),
	db = require("./config/database.js");

var	Promise = require('promise');
var fs = require('fs');
var app = express();

var MongoClient = require('mongodb').MongoClient;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
	limit: '50mb',
	extended: true
}));
app.use(bodyParser.json({limit: '50mb'}));

app.use(express.static('public'));
app.use(express.static('public/imges'));

app.use(morgan('dev'));
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

mongoose.Promise = global.Promise;

mongoose.connect(db.url, function(err) {
	if(err) throw err;
});

mongoose.connection.on('connected', function () { 
	
require('./config/routes.js')(app , passport, async, nodemailer, crypto, smtpTransport);

});

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

require('./config/passport.js')(passport);
app.use(session({secret: 'dlikhoiuhwaf', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

console.log(process.env.PORT || 8000);
app.listen(process.env.PORT || 8000);
