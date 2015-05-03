var request = require('supertest')('http://localhost:8080');
var session = require('supertest-session')('http://localhost:8080');
var should = require('chai').should();

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

describe('authentication', function() {
	describe('if not logged in', function() {
		it('should redirect to reddit oauth', function(done) {
			request
				.get('/login')
				.expect(302)
				.end(function(err, res) {
					should.not.exist(err);
					res.header.location.should.include('reddit.com');
					done();
				});
		});
		it('/logout should return error', function(done) {
			request
				.get('/logout')
				.expect(401)
				.end(function(err, res) {
					should.not.exist(err);
					done();
				});
		});
	});
});
