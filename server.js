//////////////////
// Dependencies //
//////////////////
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var snoocore = require('snoocore');

var app = express();
var router = express.Router();

///////////////////
// Configuration //
///////////////////
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(morgan('dev'));
var reddit = new snoocore({
	userAgent: '/u/aniforprez snoocore@0.0.0',
	oauth: {
		type: 'explicit',
		duration: 'permanent',
		key: 'R1WLYGcNacErUg',
		secret: 'zn-I4l6AS-aTjF8oXBhR_2ykNjk',
		redirectUri: 'http://localhost:8080'
	}
});

////////////
// Routes //
////////////
router.get('', function(req, res) {
	res.json({ data: 'Something' });
});

// Register the routes
app.use('', router);
///////////////////////////
// Start the application //
///////////////////////////
app.listen(8080);