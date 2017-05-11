module.exports = function(app,passport){

	app.get('/', function(req, res) {
		res.render('index',{title : 'Welcome'});
	});

	app.get('/signup', function(req, res) {
		res.render('signup');
	});

	app.get('/login', function(req, res) {
		res.render('login');
	});

	app.post('/signup', passport.authenticate('local-signup',{
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }),
	function(req,res){
		console.log("Sign up Success for user:",req.user.data.email);
		res.redirect('/');
	});
}
