/* global process */
/* global __dirname */
"use strict";

var gulp = require("gulp");
var runSequence = require("run-sequence");
var karma = require("karma").server;
var pkg = require("./package.json");
var util = require("gulp-util");
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var rimraf = require("gulp-rimraf");

var objectValues = function(obj) { return Object.keys(obj).map(function(key) { return obj[key]; }); };
var toBoolean = function(bool, defaultVal) { return typeof bool === "undefined" ? defaultVal : bool && bool.match ? bool.match(defaultVal ? /false|no/i : /true|yes/i) ? !defaultVal : defaultVal : !!bool; };
var handleError = function(error) { if (!IS_WATCHING) { util.log(error); } if (FATAL_ERRORS) { process.exit(1); } else if (IS_WATCHING) { this.emit("end"); }};
var handleTestError = function(callback) { return function(exitCode) { callback(FATAL_ERRORS ? exitCode : 0); }; };

var IS_DEV = toBoolean(util.env.dev, false);
var IS_WATCHING = util.env._.indexOf("watch") > -1;
var FATAL_ERRORS = toBoolean(util.env.fatal, !IS_WATCHING);

var src = {
	base: "./",
	js: ["src/*.js"]
};

var dest = {
	dir: {
		build: "build/",
		dist: "dist/"
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
		callback
	);
});

gulp.task("watch", ["default"], function() {
	gulp.watch(src.js, ["js"]);
});

gulp.task("clean", function() {
	return gulp.src(objectValues(dest.dir), { read: false })
		.pipe(rimraf());
});

function jsTask(isDist)
{
	var dir = isDist ? dest.dir.dist : dest.dir.build;

	return gulp.src(src.js)
		.pipe(sourcemaps.init())
		.pipe(concat(dest.file.min))
		// Mangle will shorten variable names which breaks the AngularJS dependency injection.
		// TODO: Use a build tool to preserve the important variables instead of disabling mangle.
		.pipe(uglify({ mangle: false }))
		.pipe(sourcemaps.write("./", { sourceRoot: sourceRoot }))
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