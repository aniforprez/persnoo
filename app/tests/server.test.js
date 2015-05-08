var request = require('supertest')('http://localhost:8080');
var should = require('chai').should();
var Nightmare = require('nightmare');
var fs = require('fs');

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
	it('/login redirect to reddit oauth', function(done) {
		var fired = false;
		this.timeout(0);
		new Nightmare({ weak: false, loadImages: false })
			.on('urlChanged', function(url) {
				url.should.have.string('reddit.com');
				fired = true;
			})
			.goto('http://localhost:8080/login')
			.run(function() {
				fired.should.be.true;
				done();
			});
	});
});

describe('authentication', function() {
	var browser;
	before(function() {
		browser = new Nightmare({
			weak: false,
			loadImages: false,
			cookiesFile: 'app/tests/cookie.txt'
		});
		fs.unlinkSync('app/tests/cookie.txt');
	});
	
	it('should successfully login', function(done) {
		var fired = false;
		this.timeout(0);
		browser
			.goto('http://localhost:8080/login')
			.wait()
			.type('input#user_login', 'delicioustest')
			.type('input#passwd_login', 'testiculartests')
			.click('form#login-form button[type="submit"]')
			.wait()
			.click('input[type="submit"][value="Allow"]')
			.wait()
			.url(function(url) {
				url.should.be.equal('http://localhost:8080/');
			})
			.run(function(err, nightmare) {
				if (fs.existsSync('app/tests/cookie.txt')) {
					var cookies = fs.readFileSync('app/tests/cookie.txt', { encoding: 'utf8' }).split('\r\n');
					console.log(cookies);
					cookies.forEach(function (cookie) {
						var detail = cookie.split('\t'),
						newCookie = {
							'name':   detail[5],
							'value':  detail[6],
							'domain': detail[0],
							'path':   detail[2]
						};
						console.log(newCookie);
					});
				}
				should.not.exist(err);
				done();
			});
	});
});
