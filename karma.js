module.exports = function(config)
{
	config.set({

		frameworks: ["jasmine"],

		basePath: "./",
		files: [

			// deps
			"bower_components/angular/angular.js",
			"bower_components/angular-mocks/angular-mocks.js",

			// src
			"src/*.js",

			// tests
			"tests/*.test.js"
		],

		browsers: ["PhantomJS"],

		captureTimeout: 60000,
		logLevel: "INFO",
		autoWatch: false,
		colors: true

	});
};