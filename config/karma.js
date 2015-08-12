module.exports = function(conf) {
	"use strict";
	conf.set({
		basePath: "../",
		files: [
			// Test subjects dependencies
			"bower_components/angular/angular.js",

			// Test subjects
			"src/*.coffee",

			// Test dependencies
			"bower_components/angular-mocks/angular-mocks.js",
			"node_modules/underscore/underscore.js",
			"bower_components/jasmine-underscore/lib/jasmine-underscore.js",
			"bower_components/dialog-polyfill/dialog-polyfill.js",

			// Tests
			"tests/*.coffee"
		],
		frameworks: ["jasmine"],
		reporters: [
			"coverage",
			"progress"
		],
		browsers: ["PhantomJS"],
		port: 9876,
		captureTimeout: 60000,
		logLevel: "INFO",
		autoWatch: false,
		singleRun: true,
		colors: true,
		preprocessors: {
			"**/src/*.coffee": ["coverage"],
			"**/tests/*.coffee": ["coffee"]
		},
		coverageReporter: {
			type: "html",
			dir: "coverage",
			subdir: "."
		}
	});
};
