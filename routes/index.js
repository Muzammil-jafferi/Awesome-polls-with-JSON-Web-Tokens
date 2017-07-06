var express = require('express');
var passport = require('passport');
var router = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var request = require('request');

// We are going to want to share some data between our server and UI, so we'll be sure to pass that data in an env variable.
var env = {
	AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
	AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
	AUTH0_CALLBACK_URL: 'http://localhost:3000/callback'
};

router.get('/', function(req, res, next) {
	// Now, rather then just sending the text "You are on the homepage", we are going to actually render the view we created using the res.render method. The second argument will allow us to pass in data from the backend to our view dynamically.
	res.render('index.html', {
		env: env
	});
});

router.get('/login', function(req, res) {
	// Same thing for the login page.
	res.render('login.html', {
		env: env
	});
});

router.get('/logout', function(req, res) {
	// For the logout page, we don't need to render a page, we just want the user to be logged out when they hit this page. We'll use the ExpressJS built in logout method, and then we'll redirect the user back to the homepage.
	req.logout();
	res.redirect('/');
});

router.get('/callback',
	passport.authenticate('auth0', {
		failureRedirect: '/'
	}),
	function(req, res) {
		res.redirect(req.session.returnTo || '/polls');
	});

router.get('/polls', ensureLoggedIn, function(req, res) {
	// You may have noticed that we included two new require files, one of them being request. Request allows us to easily make HTTP requests. In our instance here, we are using the Huffington Post's API to pull the latest election results, and then we're sending that data to our polls view.
	// The second require was the connect-ensure-loggedin library, and from here we just required a method called ensureLoggedIn, which will check and see if the current user is logged in before rendering the page. If they are not, they will be redirected to the login page. We are doing this in a middleware pattern, we first call the ensureLoggedIn method, wait for the result of that action, and finally execute our /polls controller.
	request('http://elections.huffingtonpost.com/pollster/api/charts.json?topic=2016-president', function(error, response, body) {
		if (!error && response.statusCode == 200) {
			if (typeof body == "string") {
				var polls = JSON.parse(body);
			}
			// For this view, we are not only sending our environmental information, but the polls and user information as well.
			res.render('polls', {
				env: env,
				user: req.user,
				polls: polls
			});
		} else {
			res.render('error');
		}
	})
})

router.get('/user', ensureLoggedIn, function(req, res, next) {
	// Same thing for our 
	res.render('user', {
		env: env,
		user: req.user
	});
});

module.exports = router;