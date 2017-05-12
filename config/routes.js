module.exports = function(app,passport){

	app.get('/', function(req, res) {
		var loggedIn =false;
		if(req.session.loggedIn)loggedIn = req.session.loggedIn;
		res.render('index',{title : 'Welcome', loggedIn : loggedIn});
	});

	app.get('/signup', function(req, res) {
		res.render('signup');
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

	function isLoggedIn(req, res, next) {
		if(req.isAuthenticated()) return next();
		res.redirect('/notloggedin');
	};
}
