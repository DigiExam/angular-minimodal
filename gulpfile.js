/* global process, __dirname */
"use strict";

var gulp = require("gulp");
var runSequence = require("run-sequence");
var pkg = require("./package.json");
var util = require("gulp-util");
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var del = require("del");
var rename = require("gulp-rename");
var karma = require("karma").server;
var jshint = require("gulp-jshint");

var config = {
	karma: __dirname + "/karma.js"
};

var src = {
	base: "./",
	js: ["src/*.js"]
};

var dest = {
	dir: {
		build: "build/",
		dist: "dist/",
		coverage: "coverage/"
	},
	file: "angular-minimodal-${version}"
};

var sourceRoot = "src";

gulp.task("default", function(callback)
{
	runSequence(
		"clean",
		"jshint",
		"test",
		"js",
		callback
	);
});

gulp.task("dist", function(callback)
{
	runSequence(
		"clean",
		"jshint",
		"test",
		"js-dist",
		callback
	);
});

gulp.task("watch", ["default", "jshint", "test-watch"], function()
{
	gulp.watch(src.js, ["js"]);
});

gulp.task("clean", function()
{
	return del([dest.dir.build + "*", dest.dir.coverage + "*"]);
});

function jsTask(isDist)
{
	var dir = isDist ? dest.dir.dist : dest.dir.build;
	var v = isDist ? pkg.version : "latest";
	var name = dest.file.replace("${version}", v);
	var ext = ".js";

	return gulp.src(src.js)
		.pipe(sourcemaps.init())
		.pipe(concat(name + ext))
		.pipe(gulp.dest(dir))
		.pipe(uglify({ mangle: true }))
		.pipe(rename(name + ".min" + ext))
		.pipe(sourcemaps.write("./", { sourceRoot: sourceRoot }))
		.pipe(gulp.dest(dir));
}

gulp.task("js", function()
{
	return jsTask(false);
});

gulp.task("js-dist", function()
{
	return jsTask(true);
});

gulp.task("jshint", function()
{
	return gulp.src(src.js)
		.pipe(jshint())
		.pipe(jshint.reporter("default"));
});

gulp.task("test", function(done)
{
	karma.start({
		configFile: __dirname + "/karma.js",
		singleRun: true
	}, done);
});

gulp.task("test-watch", function(done)
{
	karma.start({
		configFile: __dirname + "/karma.js",
		autoWatch: true
	});
});