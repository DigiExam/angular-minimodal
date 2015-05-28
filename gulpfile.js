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
		dist: "dist/"
	},
	file: "angular-minimodal-${version}"
};

var sourceRoot = "src";

gulp.task("default", function(callback)
{
	runSequence(
		"clean",
		"js",
		callback
	);
});

gulp.task("watch", ["default"], function()
{
	gulp.watch(src.js, ["js"]);
});

gulp.task("clean", function()
{
	return del([dest.dir.build + "*.js"]);
});

function jsTask(isDist)
{
	var dir = isDist ? dest.dir.dist : dest.dir.build;
	var name = isDist ? dest.file.replace("${version}", pkg.version) : dest.file.replace("${version}", "latest");
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

gulp.task("dist", ["js-dist"]);

gulp.task("test", function(done)
{
	karma.start({
		configFile: __dirname + "/karma.js",
		singleRun: true
	}, done);
});