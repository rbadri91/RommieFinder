var User            = require('../models/user.js');
var Posts            = require('../models/posts.js');
module.exports = function(app,passport,  async, nodemailer,crypto, smtpTransport, s3, bucketName){

	app.get('/', function(req, res) {
		var loggedIn =false;
		req.session.current_url = "home";
		if(req.session.loggedIn)loggedIn = req.session.loggedIn;
		res.render('index',{title : 'Welcome', loggedIn : loggedIn});
	});

	app.get('/signup', function(req, res) {
		res.render('signup');
	});

	var Transport = nodemailer.createTransport("SMTP",{
	        service: "Yahoo",
	        auth: {
	          user: 'badri.dev01@yahoo.com',
	          pass: 'test@123'
	        }
	});

	app.post('/login', passport.authenticate('local-login',{
        failureRedirect : '/',
        failureFlash : true // allow flash messages
    }), function(req,res){
    	req.session.loggedIn = true;
		res.redirect('/');
    });

	app.get('/login', function(req, res) {
		res.render('login');
	});

	app.get('/forgot', function(req, res) {
	  res.render('forgot', {
	    user: req.user,
	    messages : {}
	  });
	});

	app.post('/signup', passport.authenticate('local-signup',{
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }),
	function(req,res){
		req.session.loggedIn = true;
		console.log("Sign up Success for user:",req.user.data.email);
		res.redirect('/');
	});

	app.get('/logout', function(req, res) { 
		req.session.loaded=false;
		req.session.destroy();
		req.logout();
		res.redirect('/');
	});

	app.get('/profile', ensureLoggedIn,isLoggedIn,function(req, res) {
		req.session.loaded=true;
		var prevUrl=req.session.current_url.toString();
		res.render('profile', {title: 'Profile Page',prevUrl:JSON.stringify(prevUrl)});
		
	});

	app.post('/forgot', function(req, res, next) {
		console.log("email here:",req.body.email);
	  async.waterfall([
	    function(done) {
	      crypto.randomBytes(20, function(err, buf) {
	        var token = buf.toString('hex');
	        done(err, token);
	      });
	    },
	    function(token, done) {
	      User.findOne({ 'data.email': req.body.email }, function(err, user) {
	        if (!user) {
	          return res.render('forgot', {messages : req.flash('error', 'No account with that email address exists.') });
	        }
	        user.data.resetPasswordToken = token;
	        user.data.resetPasswordExpires = Date.now() + 3600000;
	        user.save(function(err) {
	          done(err, token, user);
	        });
	      });
	    },
	    function(token, user, done) {
	   
	      var mailOptions = {
	        to: user.data.email,
	        from: 'badri.dev01@yahoo.com',
	        subject: 'Node.js Password Reset',
	        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
	          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
	          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
	          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
	      };
	      Transport.sendMail(mailOptions, function(error, response){
		     if(error){
		            console.log(error);
		        res.end("error");
		     }else{
		            done(error, 'done',req.flash('info', 'An e-mail has been sent to ' + user.data.email + ' with further instructions.'));
		     }
		  });
	    }
	  ], function(err) {
	    if (err) return next(err);
	    res.redirect('/forgot');
	  });
	});

	app.get('/reset',function(req,res){
		console.log("user here:",req.user);
		res.render('reset', {
	      firstName: req.user.data.firstName,
	      lastName: req.user.data.lastName
	    });
	});

	app.get('/overview',ensureLoggedIn,function(req,res){
		res.render('overview', {

	    });
	});

	app.get('/preferences',ensureLoggedIn,function(req,res){
		res.render('preferences', {
			sleepTime:req.user.data.sleepTime,
			wakeupTime:req.user.data.wakeupTime,
			acceptVisitor:req.user.data.acceptVisitor,
			listenMusic:req.user.data.listenMusic,
			smoke:req.user.data.smoke,
			roomClean:req.user.data.roomClean,
			share:req.user.data.share

	    });
	});

	app.get('/posts',ensureLoggedIn,function(req,res){
		Posts.find({user:req.user._id },function(err,datas){
			if(err) throw err;
			console.log("datas here:",datas);
			res.render('posts', {
				posts: datas
		    });
		});
		// console.log("posts here:",req.user.data.Posts[0].imageUrl[0]);
		
	});


	app.get('/about',ensureLoggedIn,function(req,res){
		var profileSrc="";

		if(req.user.data.profileURL){
			profileSrc = req.user.data.profileURL;
		}else{
			if(req.user.data.gender=="Male"){
				profileSrc="/images/defaultUserMale.png";
			}else{
				profileSrc="/images/defaultUserFemale.jpg";
			}
		}
		res.render('about', {
	      about: req.user.data.about,
	      profilesrc:profileSrc
	    });
	});

	app.get('/settings',ensureLoggedIn,function(req,res){
		res.render('settings', {
	      firstName: req.user.data.firstName,
	      lastName: req.user.data.lastName,
	      email:req.user.data.email,
	      correspondanceEmail:req.user.data.correspondanceEmail,
	      dob: req.user.data.dob,
	      gender:req.user.data.gender,
	      contactNo:req.user.data.contact,
	      notifEnabled:req.user.data.notifEnabled
	    });
	});

	app.post('/saveAboutMe',ensureLoggedIn,function(req,res){
		req.user.data.about = req.body.aboutUpdate;
		req.user.save();
		res.send("Success");
	});

	app.post('/saveName',ensureLoggedIn,function(req,res){
		req.user.data.firstName = req.body.firstName;
		req.user.data.lastName = req.body.lastName;
		req.user.save();
		res.send("Success");
	});

	app.post('/saveCorresEmail',ensureLoggedIn,function(req,res){
		req.user.data.correspondanceEmail = req.body.corresEmail;
		req.user.save();
		res.send("Success");
	});

	app.post('/updatePassword',ensureLoggedIn,function(req,res){
		if(!req.user.validPassword(req.body.oldPassword)){
			res.status(400).send('Oops!!Wrong Password')
		}else{
			req.user.data.password = req.user.generateHash(req.body.newPassword);
			req.user.save();
			res.send("Success");
		}
		
	});

	app.post('/updateDOB',ensureLoggedIn,function(req,res){
		req.user.data.dob = req.body.newDOB;
		req.user.save();
		res.send("Success");
	});

	app.post('/updateGender',ensureLoggedIn,function(req,res){
		req.user.data.gender = req.body.gender;
		req.user.save();
		res.send("Success");
	});

	app.post('/updateContact',ensureLoggedIn,function(req,res){
		req.user.data.contact = req.body.contactNo;
		req.user.save();
		res.send("Success");
	});

	app.post('/saveNotificationSetting',ensureLoggedIn,function(req,res){
		req.user.data.notifEnabled = req.body.notifEnabled;
		req.user.save();
		res.send("Success");
	});
	

	app.post('/savePreference',ensureLoggedIn,function(req,res){
			req.user.data.sleepTime=req.body.sleepTime;
			req.user.data.wakeupTime=req.body.wakeupTime;
			req.user.data.acceptVisitor=req.body.acceptVisitor;
			req.user.data.listenMusic=req.body.listenMusic;
			req.user.data.smoke=req.body.smoke;
			req.user.data.roomClean=req.body.roomClean;
			req.user.data.share=req.body.share;
			req.user.save();
			res.send("Success");
	});

	app.get('/sign-s3', function(req, res){
	  var userId = req.user._id.toString();
	  var fol1= userId.substring(0,2);
	  var fol2 =userId.substring(2,9);
	  var fol3 =userId.substring(9,18);
	  var fol4 =userId.substring(18,24);
	  var  fileName = req.query['file-name'];
	  const fileType = req.query['file-type'];
	  fileName = fol1 +"/"+ fol2 +"/" +fol3 +"/" +fol4 +"/"+fileName;
	  const s3Params = {
	    Bucket: bucketName,
	    Key: fileName,
	    Expires: 60,
	    ContentType: fileType,
	    ACL: 'public-read'
	  };

	  s3.getSignedUrl('putObject', s3Params, (err, data) => {
	    if(err){
	      console.log(err);
	      return res.end();
	    }
	    console.log("data here:",data);
	    const returnData = {
	      signedRequest: data,
	      url: `https://${bucketName}.s3.amazonaws.com/${fileName}`
	    };

	    if(fileName.indexOf("sublet")==-1 && fileName.indexOf("Roommate")==-1){
	    		req.user.data.profileURL = returnData.url;
	    		req.user.save();
	    }
	   
	    res.write(JSON.stringify(returnData));
	    res.end();
	  });
	});

	app.get('/reset/:token', function(req, res) {
	  User.findOne({ 'data.resetPasswordToken': req.params.token, 'data.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
	    if (!user) {
	    	console.log("in reset here");
	      req.flash('error', 'Password reset token is invalid or has expired.');
	      return res.redirect('/forgot');
	    }
	    res.render('reset', {
	      firstName: user.data.firstName,
	      lastName: user.data.lastName
	    });
	  });
	});

	app.post('/reset/:token', function(req, res) {
	  async.waterfall([
	    function(done) {
	      User.findOne({ 'data.resetPasswordToken': req.params.token, 'data.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
	        if (!user) {
	          req.flash('error', 'Password reset token is invalid or has expired.');
	          return res.redirect('back');
	        }

	        user.data.password = user.generateHash(req.body.password);
	        user.data.resetPasswordToken = undefined;
	        user.data.resetPasswordExpires = undefined;

	        user.save(function(err) {
	          req.logIn(user, function(err) {
	            done(err, user);
	          });
	        });
	      });
	    },
	    function(user, done) {
	      var mailOptions = {
	        to: user.data.email,
	        from: 'badri.dev01@yahoo.com',
	        subject: 'Your password has been changed',
	        text: 'Hello,\n\n' +
	          'This is a confirmation that the password for your account ' + user.data.email + ' has just been changed.\n'
	      };
	      Transport.sendMail(mailOptions, function(error, response){
		     if(error){
		            console.log(error);
		        res.end("error");
		     }else{
		            done(error, 'done',req.flash('success', 'Success! Your password has been changed.'));
		     }
		  });
	    }
	  ], function(err) {
	    res.redirect('/');
	  });
	});

	app.post('/createNewPost',ensureLoggedIn,function(req,res){
			var postContents = req.body.postDesc;
			console.log("postContents:",postContents);
			var location = postContents.location;
			var postDesc = postContents.desc;
			var imageURL = postContents.urls;
			var postType = postContents.postReason;
			var today,ddd,m,yyyy;
			today = new Date();
			dd = today.getDate();
			mm = today.getMonth() + 1;
			yyyy = today.getFullYear();

			if (dd < 10) {
				dd = '0' + dd
			}

			if (mm < 10) {
				mm = '0' + mm
			}

			today =  mm + '-' + dd +"-"+yyyy;
			var posts = new Posts();
			posts.postType = postType;
			posts.imageUrl = imageURL;
			posts.postDesc = postDesc;
			posts.postLocation = location;
			posts.timestamp = today;
			posts.user = req.user._id;
			posts.save();
			// req.user.data.Posts.push({"postType":postType,"imageUrl":imageURL,"postDesc":postDesc,"postLocation":location,"timestamp":today})
			// req.user.save();
			res.send("Success");
	});

	function isLoggedIn(req, res, next) {
		if(req.isAuthenticated()) return next();
		res.redirect('/notloggedin');
	};
}
