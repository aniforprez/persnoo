var request = require('supertest')('http://localhost:8080');
var should = require('chai').should();

describe('the server', function() {
	it('should return something', function(done) {
		request
			.get('/')
			// .expect('Content-Type', /json/)
			.expect(200)
			.end(function(err, res) {
				should.not.exist(err);
				done();
			});
	});
	it('should redirect to reddit oauth page on login request', function(done){
		request
			.get('/login')
			.expect(302)
			.end(function(err, res) {
				should.not.exist(err);
				res.header.location.should.include('reddit.com');
				done();
			});
	});
});
