var User            = require('../models/user.js');
var Posts            = require('../models/posts.js');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
module.exports = function(app,passport,  async, nodemailer,crypto, smtpTransport, s3, bucketName, Promise){

	app.get('/', function(req, res) {
		var loggedIn =false;
		var hasUpdatedProfile = false;
		if(req.session.loggedIn)loggedIn = req.session.loggedIn;
		if(req.user && req.user.data.hasUpdatedProfile) hasUpdatedProfile = req.user.data.hasUpdatedProfile;
		res.render('index',{title : 'Welcome', loggedIn : loggedIn, hasUpdatedProfile: hasUpdatedProfile});
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

	app.get('/profile',isLoggedIn,function(req, res) {
		console.log("it comes here:");
		req.session.loaded=true;
		res.render('profile', {title: 'Profile Page',prevUrl:JSON.stringify("home")});
		
	});

	app.get('/viewUserPosts',isLoggedIn,function(req, res) {
		var prevUrl = "viewUserPosts"
		res.render('profile', {title: 'Profile Page',prevUrl:JSON.stringify(prevUrl)});
	});

	app.get('/viewUserPreference',isLoggedIn,function(req, res) {
		var prevUrl = "viewUserPreference";
		res.render('profile', {title: 'Profile Page',prevUrl:JSON.stringify(prevUrl)});
	});

	app.post('/viewFullPost',isLoggedIn,function(req,res){
		req.session.currentPost = req.body.post;
		req.session.current_url ="viewFullPost";
		req.session.currPostDate = req.body.post.timestamp;
		res.end("Success");
	});

	app.post('/saveLocation',isLoggedIn,function(req,res){
		var oldLocation = req.body.oldLocation;
		var postType = req.body.postType;
		var date = req.body.date;
		var location = req.body.location;
		Posts.findOne({"postType":postType,"timestamp":date,"postLocation":oldLocation},function(err,data){
			if(err) return err;
			data.postLocation= location;
			data.save();
			res.send("Success");
		});

	});

	app.post('/savePostType',isLoggedIn,function(req,res){ 
		var postType = req.body.postType;
		var date = req.body.date;
		var location = req.body.location;
		Posts.findOne({"user":req.user._id,"timestamp":date,"postLocation":location},function(err,data){
			console.log("data here:",data);
			if(err) return err;
			data.postType= postType;
			data.save();
			res.send("Success");
		});

	});

	app.post('/updatePostInterest',isLoggedIn,function(req,res){ 
		var date = req.body.date;
		var location = req.body.location;
		var emailId = req.body.listerEmail;
		var postInterest = req.body.postInterest;
		User.findOne({"data.email":emailId},function(err,user){
			if(err) res.end("User Not found")
			if(user){
				Posts.findOne({"user":user._id,"timestamp":date,"postLocation":location},function(err,data){
					
					if(err) res.end("Post Not found")
					if(postInterest =="Interested"){
						if(data.hasInterests && data.hasInterests.indexOf(req.user._id) ==-1){
							data.hasInterests.push(req.user._id);
							data.save();
						}else if(!data.hasInterests){
							data.hasInterests =[];
							data.hasInterests[0] =req.user._id;
							data.save();
						}
					}else{
						if(data.hasInterests && data.hasInterests.indexOf(req.user._id) !=-1){
							var index = data.hasInterests.indexOf(req.user._id);
							data.hasInterests.splice(index,1);
							data.save();
						}
					}	
					
					
					res.send("Success");
				});
			}
		})
		

	});

	app.post('/savePostStatus',isLoggedIn,function(req,res){ 
		var postStatus = req.body.postCurrStatus;
		var date = req.body.date;
		var location = req.body.location;
		Posts.findOne({"user":req.user._id,"timestamp":date,"postLocation":location},function(err,data){
			console.log("data here:",data);
			if(err) return err;
			data.status= postStatus;
			data.save();
			res.send("Success");
		});

	});

	app.post('/saveNewPostDesc',isLoggedIn,function(req,res){
		var postType = req.body.postType;
		var date = req.body.date;
		var postContent = req.body.postContent;
		Posts.findOne({"user":req.user._id,"timestamp":date,"postType":postType},function(err,data){
			if(err) return err;
			if(data){
				data.postDesc= postContent;
				data.save();
				res.send("Success");
			}else{
				res.send("No Post found");
			}
			
		});
	});


	app.get('/viewFullPost',isLoggedIn,function(req,res){
		var post = req.session.currentPost;
		console.log("post here:",post);
		res.render('updateposts',{title:'Update Posts',post:post});
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
	        subject: 'RommieFinder Password Reset',
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

	app.get('/overview',isLoggedIn,function(req,res){
		res.render('overview', {

	    });
	});

	app.get('/preferences',isLoggedIn,function(req,res){
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

	app.get('/posts',isLoggedIn,function(req,res){
		Posts.find({user:req.user._id },function(err,datas){
			if(err) throw err;
			console.log("datas here:",datas);
			res.render('posts', {
				posts: datas
		    });
		});
		// console.log("posts here:",req.user.data.Posts[0].imageUrl[0]);
		
	});


	app.get('/about',isLoggedIn,function(req,res){
		var profileSrc="";
		console.log("req.user:",req.user);
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

	app.get('/settings',isLoggedIn,function(req,res){
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

	app.post('/saveAboutMe',isLoggedIn,function(req,res){
		console.log("req.user here about:",req.user);
		req.user.data.about = req.body.aboutUpdate;
		req.user.save();
		res.send("Success");
	});

	app.post('/saveName',isLoggedIn,function(req,res){
		req.user.data.firstName = req.body.firstName;
		req.user.data.lastName = req.body.lastName;
		req.user.save();
		res.send("Success");
	});

	app.post('/saveCorresEmail',isLoggedIn,function(req,res){
		req.user.data.correspondanceEmail = req.body.corresEmail;
		req.user.save();
		res.send("Success");
	});

	app.post('/updatePassword',isLoggedIn,function(req,res){
		if(!req.user.validPassword(req.body.oldPassword)){
			res.status(400).send('Oops!!Wrong Password')
		}else{
			req.user.data.password = req.user.generateHash(req.body.newPassword);
			req.user.save();
			res.send("Success");
		}
		
	});

	app.post('/updateDOB',isLoggedIn,function(req,res){
		req.user.data.dob = req.body.newDOB;
		req.user.save();
		res.send("Success");
	});

	app.post('/updateGender',isLoggedIn,function(req,res){
		req.user.data.gender = req.body.gender;
		req.user.save();
		res.send("Success");
	});

	app.post('/updateContact',isLoggedIn,function(req,res){
		req.user.data.contact = req.body.contactNo;
		req.user.save();
		res.send("Success");
	});

	app.post("/SearchMatches",isLoggedIn,function(req,res){
		var place = req.body.placeVal;
		var roomType = parseInt(req.body.noRooms);
		var priceRange = req.body.priceRange;
		var fineWithChildrens = parseInt(req.body.fineWithChildrens);
		var fineWithPets = parseInt(req.body.fineWithPets);
		var lowerpriceVal = 0;
		var upperpriceVal = 0;
		console.log("place:",place);
		console.log("roomType:",roomType);
		console.log("priceRange:",priceRange);
		console.log("fineWithChildrens:",fineWithChildrens);
		console.log("fineWithPets:",fineWithPets);
		if(priceRange == "1"){
			lowerpriceVal = 500;
			upperpriceVal =1000;
		}else if(priceRange == "2"){
			lowerpriceVal = 1000;
			upperpriceVal =2000;
		}else if(priceRange == "3"){
			lowerpriceVal = 2000;
			upperpriceVal =3000;
		}
		else if(priceRange == "4"){
			lowerpriceVal =3000;
		}
		console.log("lowerpriceVal:",lowerpriceVal);
		console.log("upperpriceVal:",upperpriceVal);

		var sleepTime = req.user.sleepTime;
		var wakeupTime =req.user.wakeupTime;
		var acceptVisitor =req.user.acceptVisitor;
		var listenMusic =req.user.listenMusic;
		var smoke =req.user.smoke;
		var roomClean =req.user.roomClean;
		var share =req.user.share;
		var pets = req.user.pets;

		// Posts.find({"roomType":roomType,"postLocation":place,"hasPets":fineWithPets,"hasChildren":fineWithChildrens},function(err,data){
		// 	console.log("data here:",data);
		// });

		Posts.find({"roomType":roomType,"postLocation":place,"hasPets":fineWithPets,"hasChildren":fineWithChildrens,"price":{$gt:lowerpriceVal,$lt:upperpriceVal}},function(err,lists){
			if(err){
				return err;
			}
			console.log("lists here:",lists);
			var userandPostInfo =[];
			var promises = [];
			async.each(lists,function(list,callback){
				console.log("list here:",list);
				promises.push( new Promise((resolve) => {
					User.findOne({
						"_id" :list.user,
						"sleepTime":sleepTime,
						"wakeupTime":wakeupTime,
						"acceptVisitor":acceptVisitor,
						"listenMusic":listenMusic,
						"smoke":smoke,
						"roomClean":roomClean,
						"share":share,
						"pets":pets
					},function(err,data){
						if(err){
								res.end("error");
						}
						if(data){
							console.log("data here:",data);
							var userInfo =data;
							var postInfo = list;
							userandPostInfo.push({"userInfo":userInfo,"postInfo":postInfo});
						}
						resolve();
					});
				}));
			})
			Promise.all(promises).then(() => {
				res.send(userandPostInfo);
            }).catch((e) => {
				   res.end("error");
			})
		});
	});

	app.get('/callback',
	  passport.authenticate('auth0', { failureRedirect: '/' }),
	  function(req, res) {
	    res.redirect(req.session.returnTo || '/profile');
	});

	app.post('/saveNotificationSetting',isLoggedIn,function(req,res){
		req.user.data.notifEnabled = req.body.notifEnabled;
		req.user.markModified('data.notifEnabled');
		req.user.save();
		res.send("Success");
	});

	app.post('/viewPostDetails',isLoggedIn,function(req,res){
		req.session.postSelected = req.body.userandPostInfo;
		res.send("Success");
	});

	app.get('/viewPostDetails',isLoggedIn,function(req,res){
		var hasFavorited = (req.session.postSelected.postInfo.hasInterests.indexOf(req.user._id)!=1);
		res.render('postDescription',{"postDescription": req.session.postSelected,"hasFavorited":hasFavorited})
	});

	app.post('/savePreference',isLoggedIn,function(req,res){
			req.user.data.sleepTime=req.body.sleepTime;
			req.user.data.wakeupTime=req.body.wakeupTime;
			req.user.data.acceptVisitor=req.body.acceptVisitor;
			req.user.data.listenMusic=req.body.listenMusic;
			req.user.data.smoke=req.body.smoke;
			req.user.data.roomClean=req.body.roomClean;
			req.user.data.share=req.body.share;
			req.user.data.hasUpdatedProfile = true;
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

	    if(req.session.current_url =="viewFullPost"){
	    	var postType ="";
		    if(fileName.indexOf("sublet") !=-1){
		    	postType = "sublet";
		    }else if(fileName.indexOf("Roommate") !=-1){ 
		    	postType = "Roommate";
		    }
		    Posts.findOne({"user":req.user._id,"timestamp":req.session.currPostDate,"postType":postType},function(err,data){
		    	if(data){
			    	data.imageUrl.push(returnData.url);
			    	data.save();
			    	res.write(JSON.stringify(returnData));
		    		res.end();
		    	}
		    })
	    }else{
	    	res.write(JSON.stringify(returnData));
	    	res.end();
	    }

	    

	    //req.session.currPostDate

	   
	    
	  });
	});

	app.post("/deletePost",isLoggedIn,function(req,res){
		var filesArray = req.body.fileUrls;
		var postType = req.body.postType;
		var postLocation = req.body.postLocation;
		var objects = [];
		for(var file of filesArray){
			  objects.push({Key : file});
		}
		var options = {
			Bucket: bucketName,
			Delete: {
			    Objects: objects
			}
		};

		s3.deleteObjects(options, function(err, data){
			if(data){
				Posts.find({"user":req.user._id,"postType":postType,"postLocation":postLocation}).remove().exec();
				res.send("success");
			}else{
				res.end("error");
			}
			
		

		});
	});	

	app.post("/deleteImages",isLoggedIn,function(req,res){
			var filesArray = req.body.filesArray;
			var fullFileURL = req.body.fullFilePath;
			var date = req.body.date;
			var postType = req.body.postType;
			var objects = [];
			for(var file of filesArray){
			  objects.push({Key : file});
			}
			console.log("objects here:",objects);
			var options = {
			  Bucket: bucketName,
			  Delete: {
			    Objects: objects
			  }
			};

			console.log("options here:",options);

			s3.deleteObjects(options, function(err, data){
				if(data){
					Posts.findOne({"user":req.user._id,"timestamp":date,"postType":postType},function(err,data){
						if(data){
							var index = data.imageUrl.indexOf(fullFileURL);
							if (index > -1) {
								data.imageUrl.splice(index, 1);
							}
							data.save();
						}
						res.send("success");
					});
					
				}else{
					res.end("error");
				}
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

	app.post('/createNewPost',isLoggedIn,function(req,res){
			var postContents = req.body.postDesc;
			console.log("postContents:",postContents);
			var location = postContents.location;
			var postDesc = postContents.desc;
			var imageURL = postContents.urls;
			var postType = postContents.postReason;
			var price = parseInt(postContents.price);
			var roomType = postContents.roomType;
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
			posts.price = price;
			posts.roomType =roomType;
			if(postContents.pets){
				posts.hasPets =postContents.pets;
			}
			if(postContents.children){
				posts.hasChildren =postContents.children;
			}
			posts.status ="available";
			posts.save();
			// req.user.data.Posts.push({"postType":postType,"imageUrl":imageURL,"postDesc":postDesc,"postLocation":location,"timestamp":today})
			// req.user.save();
			res.send("Success");
	});

	function isLoggedIn(req, res, next) {
		if(req.isAuthenticated()) return next();
		res.redirect('/');
	};

	function deleteFile() {
	    var bucketInstance = new AWS.S3();
	    var params = {
	        Bucket: 'BUCKET_NAME',
	        Key: 'FILENAME'
	    };
	    bucketInstance.deleteObject(params, function (err, data) {
	        if (data) {
	            console.log("File deleted successfully");
	        }
	        else {
	            console.log("Check if you have sufficient permissions : "+err);
	        }
	    });
	}
}
