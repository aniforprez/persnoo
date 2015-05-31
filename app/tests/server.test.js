var request = require('supertest')('http://localhost:8080');
var should = require('chai').should();
var Nightmare = require('nightmare');
var fs = require('fs');

var loginUrl = '';
var Cookies = '';

describe('the server', function() {
	it('should be running', function(done) {
		request
			.get('/')
			// .expect('Content-Type', /json/)
			.expect(200)
			.end(function(err, res) {
				should.not.exist(err);
				done();
			});
	});
});

describe('unauthenticated requests', function() {
	it('should reject when requesting saved posts', function(done) {
		request
			.get('/api/saved')
			.expect(401)
			.end(done);
	});

	it('should reject when logging out (you\'re not logged in DUH)', function(done) {
		request
			.get('/api/logout')
			.expect(401)
			.end(done);
	});

	it('/api/login redirect to reddit oauth', function(done) {
		var fired = false;
		this.timeout(0);
		new Nightmare({ weak: false, loadImages: false })
			.on('urlChanged', function(url) {
				url.should.have.string('reddit.com');
				fired = true;
			})
			.goto('http://localhost:8080/api/login')
			.run(function() {
				fired.should.be.true;
				done();
			});
	});
});

describe('authentication', function() {
	var browser;
	before(function(done) {
		this.timeout(0);
		browser = new Nightmare({
			weak: false,
			loadImages: false
		});
		browser
			.goto('http://localhost:8080/api/login')
			.wait()
			.type('input#user_login', 'delicioustest')
			.type('input#passwd_login', 'testiculartests')
			.click('form#login-form button[type="submit"]')
			.wait()
			.click('input[type="submit"][value="Allow"]')
			.wait()
			.url(function(url) {
				loginUrl = url.replace('http://localhost:8080', '');
			})
			.run(function(err, nightmare) {
				done();
			});
	});
	
	it('should successfully login with a redirect url', function(done) {
		this.timeout(0);
		request
			.get(loginUrl)
			.expect(200)
			.end(function(err, res) {
				Cookies = res.headers['set-cookie'].pop().split(';')[0];
				res.body.responseStatus.should.equal('success');
				done();
			});
	});
	it('should fetch saved posts when logged in', function(done) {
		var req = request.get('/api/saved');
		req.cookies = Cookies;
		req.set('Accept','application/json')
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				done();
			});
	});
});