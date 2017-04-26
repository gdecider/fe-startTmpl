'use strict';

var gulp        = require('gulp');
var sass        = require('gulp-sass');
var browserSync = require('browser-sync');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var cleanCss    = require('gulp-clean-css');
var rename      = require('gulp-rename');
var del         = require('del');
var imagemin    = require('gulp-imagemin');
var pngquant    = require('imagemin-pngquant');
var cache       = require('gulp-cache');
var autoprefixer= require('gulp-autoprefixer');
var sourcemaps  = require('gulp-sourcemaps');

// обработка sass
gulp.task('sass', function(){
	return gulp.src('./app/sass/**/*.+(sass|scss)')
			.pipe(sass())
			.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
			.pipe(gulp.dest('app/css'))
			.pipe(browserSync.reload({stream: true}));
});

// uglify
gulp.task('scripts', function(){
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',		
	])
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'));
});

// uglify css libs
gulp.task('minify-css', ['sass'], function(){
	return gulp.src([
		'app/css/**/*.css',		
	])
	.pipe(sourcemaps.init())
	.pipe(cleanCss())
	.pipe(sourcemaps.write())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('app/css'));
});

// browser-sync
gulp.task('sync', function(){
	browserSync({
		server: {
			baseDir: 'app',
		},
		notify: false
	});
});

// minify img
gulp.task('img', function(){
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPluggins: [{removeViewBox: false}],
		use: [pngquant()]
	})))
	.pipe(gulp.dest('dist/img'));
});

// clean build dir
gulp.task('clean', function(){
	return del.sync('dist');
});

// clear cache
gulp.task('clear', function(){
	return cache.clearAll();
});

// watcher
gulp.task('watch', ['sync', 'minify-css', 'scripts'], function(){
	gulp.watch('./app/sass/**/*.+(sass|scss)', ['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

// build
gulp.task('build', ['clean', 'minify-css', 'scripts', 'img'], function(){
	var buildCss = gulp.src([
		'app/css/main.css',
		'app/css/libs.min.css',
	])
	.pipe(gulp.dest('dist/css'));

	var buildFonts = gulp.src([
		'app/fonts/**/*',
	])
	.pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src([
		'app/js/**/*',
	])
	.pipe(gulp.dest('dist/js'));

	var buildHtml = gulp.src([
		'app/*.html',
	])
	.pipe(gulp.dest('dist'));
});