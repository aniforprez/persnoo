//////////////////
// Dependencies //
//////////////////
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var morgan = require('morgan');
var snoocore = require('snoocore');

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
		scope: ['history']
	}
});

////////////
// Routes //
////////////
app.get('/', function(req, res) {
	if(req.session.oauth) {
		res.send('Logged In!');
	}
	else {
		res.send('Something');
	}
});
app.get('/login', function(req, res) {
	if(req.session.oauth) {
		res.redirect('/');
	}
	else {
		res.redirect(reddit.getAuthUrl());
	}
});
app.get('/logout', function(req, res) {
	if(!req.session.oauth) {
		res.status(401).send();
	}
	else {
		reddit.deauth(req.session.oauth.refreshToken).then(function() {
			req.session.destroy();
		});
	}
});
app.get('/auth/callback', function(req, res) {
	var error = req.query.error;
	var state = req.query.state;
	var authCode = req.query.code;
	reddit.auth(authCode).then(function(refreshToken) {
		req.session.oauth = { refreshToken: refreshToken };
		res.redirect('/');
	});
});

///////////////////////////
// Start the application //
///////////////////////////
app.listen(8080);