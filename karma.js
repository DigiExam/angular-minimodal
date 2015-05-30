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

		preprocessors: {
			"src/*.js": ["coverage"]
		},

		reporters: [
			"progress", "coverage"
		],

		// Cannot use PhantomJS or Firefox HTMLDialogElement does not exist
		browsers: ["Chrome"],

		captureTimeout: 60000,
		logLevel: "INFO",
		autoWatch: false,
		colors: true,

		coverageReporter: {
			subdir: "."
		}

	});
};