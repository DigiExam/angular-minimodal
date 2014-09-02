"use strict";

var gulp = require("gulp");
var r = require("gulp-load-plugins")();
var runSequence = require("run-sequence");
var karma = require("karma").server;
var pkg = require("./package.json");
var objectValues = function(obj) { return Object.keys(obj).map(function(key) { return obj[key] }) };
var toBoolean = function(bool, defaultVal) { return typeof bool === "undefined" ? defaultVal : bool && bool.match ? bool.match(defaultVal ? /false|no/i : /true|yes/i) ? !defaultVal : defaultVal : !!bool; };
var handleError = function(error) {if (!IS_WATCHING) {r.util.log(error)} if (FATAL_ERRORS) {process.exit(1)} else if (IS_WATCHING) {this.emit("end")}};
var handleTestError = function(callback) {return function(exitCode) { callback(FATAL_ERRORS ? exitCode : 0); }};

var IS_DEV = toBoolean(r.util.env.dev, false);
var IS_WATCHING = r.util.env._.indexOf("watch") > -1;
var FATAL_ERRORS = toBoolean(r.util.env.fatal, !IS_WATCHING);

var config = {
	coffeelint: "./config/coffeelint.json",
	karma: {
		file: __dirname + "/config/karma.js"
	}
};

var src = {
	base: "./",
	js: "src/*.coffee"
};

var dest = {
	dir: {
		build: "build/",
		dist: "dist/",
		coverage: "coverage/"
	},
	file: {
		main: "angular-minimodal-latest.js",
		min: "angular-minimodal-latest.min.js"
	}
};

var sourceRoot = "src";

gulp.task("default", function(callback) {
	runSequence(
		"clean",
		"js",
		"test",
		callback
	);
});

gulp.task("watch", ["default"], function() {
	gulp.watch(src.js, ["js"]);
});

gulp.task("clean", function() {
	return gulp.src(objectValues(dest.dir), {read: false})
			.pipe(r.rimraf())
});

var jsTask = function(isDist)
{
	var dir = isDist ? dest.dir.dist : dest.dir.build;

	return gulp.src(src.js)
		.pipe(r.coffeelint(config.coffeelint))
		.pipe(r.coffeelint.reporter())
		.pipe(r.coffeelint.reporter("fail").on("error", handleError))
		.pipe(r.sourcemaps.init())
		.pipe(r.coffee().on("error", handleError))
		.pipe(r.concat(dest.file.min))
		// Mangle will shorten variable names which breaks the AngularJS dependency injection.
		// TODO: Use a build tool to preserve the important variables instead of disabling mangle.
		.pipe(r.uglify({ mangle: false }))
		.pipe(r.sourcemaps.write("./", {sourceRoot: sourceRoot}))
		.pipe(gulp.dest(dir));
}

gulp.task("js", function() {
	return jsTask(false);
});

gulp.task("js-dist", function()
{
	return jsTask(true);
});

gulp.task("dist", ["js-dist"]);

gulp.task("test", function(callback) {
	karma.start({
		configFile: config.karma.file
	}, handleTestError(callback))
});