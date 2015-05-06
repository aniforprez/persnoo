var request = require('supertest')('http://localhost:8080');
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
	before(function() {
		
	});
	describe('if not logged in', function() {
		it('should redirect to reddit oauth', function(done) {
			done();
		});
	});
});
