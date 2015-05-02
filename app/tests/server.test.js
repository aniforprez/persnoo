var request = require('supertest')('http://localhost:8080');

describe('the server', function() {
	it('should simply run', function(done) {
		request
			.get('')
			.expect(200, done);
	});
	it('should return some json', function(done) {
		request
			.get('/')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});
});
