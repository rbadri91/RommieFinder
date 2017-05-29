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

var dotenv = require('dotenv');

dotenv.load();

var AWS = require('aws-sdk');

var s3 = new AWS.S3();
var bucketName = process.env.S3_BUCKET;

var s3Bucket = new AWS.S3( { params: {Bucket: bucketName} } )

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

app.use(function (req, res, next) {

	    // Website you wish to allow to connect
	    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');

	    // Request methods you wish to allow
	    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	    // Request headers you wish to allow
	    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

	    // Set to true if you need the website to include cookies in the requests sent
	    // to the API (e.g. in case you use sessions)
	    res.setHeader('Access-Control-Allow-Credentials', true);

	    // Pass to next layer of middleware
	    next();
});

mongoose.Promise = global.Promise;

mongoose.connect(db.url, function(err) {
	if(err) throw err;
});

mongoose.connection.on('connected', function () { 
	
require('./config/routes.js')(app , passport, async, nodemailer, crypto, smtpTransport, s3, bucketName);

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

app.use(bodyParser.urlencoded({
	limit: '50mb',
	extended: true
}));
app.use(bodyParser.json({limit: '50mb'}));

app.use(morgan('dev'));
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

console.log(process.env.PORT || 8000);
app.listen(process.env.PORT || 8000);
