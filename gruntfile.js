module.exports = function(grunt) {
	var watchFiles = {
		mochaTests: ['app/tests/**/*.js']
	};

	grunt.initConfig({
		pkg: grunt.file.read('package.json'),
		mochaTest: {
			src: watchFiles.mochaTests,
			options: {
				reporter: 'spec',
				require: 'server.js'
			}
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', []);

	grunt.registerTask('test', ['mochaTest']);
};