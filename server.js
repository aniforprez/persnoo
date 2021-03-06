//////////////////
// Dependencies //
//////////////////
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var morgan = require('morgan');
var snoocore = require('snoocore');
var when = require('when');

var app = express();
var router = express.Router();

///////////////////
// Configuration //
///////////////////
app.use(express.static(__dirname + '/public'));
app.use(session({
	secret: 'persnooisawesome',
	store: new MongoStore({
		url: 'mongodb://localhost:27017/persnoo-app'
	}),
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(morgan('dev'));
var reddit = new snoocore({
	userAgent: '/u/aniforprez snoocore@0.0.0',
	oauth: {
		type: 'explicit',
		duration: 'permanent',
		key: 'R1WLYGcNacErUg',
		secret: 'zn-I4l6AS-aTjF8oXBhR_2ykNjk',
		redirectUri: 'http://localhost:8080/auth/callback',
		scope: ['history', 'identity'],
		throttle: 0
	}
});

////////////
// Routes //
////////////
app.get('/', function(req, res) {
	if(req.session && req.session.oauth) {
		res.send('Logged In!');
	}
	else {
		res.send('Something');
	}
});
app.get('/api/login', function(req, res) {
	if(req.session && req.session.oauth) {
		res.status(500).send({ responseStatus: 'error', error: 'Already Logged In' });
	}
	else {
		res.redirect(reddit.getAuthUrl());
	}
});
app.get('/api/logout', function(req, res) {
	if(req.session && req.session.oauth) {
		reddit.deauth(req.session.oauth.refreshToken).then(function() {
			req.session.destroy();
			res.send({ responseStatus: 'success' });
		});
	}
	else {
		res.sendStatus(401);
	}
});
app.get('/api/saved', function(req, res) {
	if(req.session && req.session.oauth) {
		var posts = [];
		reddit.refresh(req.session.oauth.refreshToken).then(function() {
			when.iterate(function(slice) {
				posts = posts.concat(slice.children);
				return slice.next();
			}, function(slice) {
				return slice.empty;
			}, function() {
				return posts;
			}, reddit('/user/' + req.session.user.name + '/saved.json').listing({
				limit: 100
			})).then(function() {
				res.send({ responseStatus: 'success', posts: posts });
			}).catch(function(err) {
				res.status(500).send({ responseStatus: 'error', error: err });
			});
		});
	}
	else {
		res.sendStatus(401);
	}
});
app.get('/auth/callback', function(req, res) {
	var error = req.query.error;
	var state = req.query.state;
	var authCode = req.query.code;
	var token = '';
	if(error) {
		res.status(500).send({ responseStatus: 'error', error: error });
	}
	reddit.auth(authCode).then(function(refreshToken) {
		token = refreshToken;
		return reddit('/api/v1/me').get();
	}).then(function(result) {
		req.session.oauth = { refreshToken: token };
		req.session.user = result;
		res.send({ responseStatus: 'success' });
	}).catch(function(err) {
		res.status(500).send({ responseStatus: 'error', error: err });
	});
});

///////////////////////////
// Start the application //
///////////////////////////
app.listen(8080);
