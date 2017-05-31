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
var plumber     = require('gulp-plumber');
var notify      = require('gulp-notify');

var srcPath = './src';
var distPath = './dist';

// ф-я для перехвата ошибок
var onError = function (err) {
    notify({
         title: 'Gulp Task Error',
         message: '!!!ERROR!!! Check the console.'
     }).write(err);

     console.log(err.toString());
     
     this.emit('end');
}

// обработка sass
gulp.task('sass', function(){
	return gulp.src(srcPath + '/sass/**/*.+(sass|scss)')
			.pipe(plumber({ errorHandle: onError }))
			.pipe(sass())
			.on('error', onError)
			.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
			.pipe(gulp.dest(srcPath + '/css'))
			.pipe(notify({
		        title   : 'Gulp Task Complete',
		        message : 'Styles have been compiled'
		    }))
			.pipe(browserSync.reload({stream: true}));
});

// uglify
gulp.task('scripts', function(){
	return gulp.src([
		srcPath + '/vendors/jquery/dist/jquery.min.js',		
	])
	.pipe(concat('vendors.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest(srcPath + '/js'));
});

// uglify css libs
gulp.task('minify-css', ['sass'], function(){
	return gulp.src([
		srcPath + '/css/**/*.css',
		'!'+srcPath + '/css/**/*.min.css',
	])
	.pipe(sourcemaps.init())
	.pipe(cleanCss())
	.pipe(sourcemaps.write())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest(srcPath + '/css'));
});

// browser-sync
gulp.task('sync', function(){
	browserSync({
		server: {
			baseDir: './src',
		},
		notify: false
	});
});

// minify img
gulp.task('img', function(){
	return gulp.src(srcPath + '/img/**/*')
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPluggins: [{removeViewBox: false}],
		use: [pngquant()]
	})))
	.pipe(gulp.dest(distPath + '/img'));
});

// clean build dir
gulp.task('clean', function(){
	return del.sync(distPath);
});

// clear cache
gulp.task('clear', function(){
	return cache.clearAll();
});

// watcher
gulp.task('watch', ['sync', 'minify-css', 'scripts'], function(){
	gulp.watch(srcPath + '/sass/**/*.+(sass|scss)', ['sass']);
	gulp.watch(srcPath + '/**/*.html', browserSync.reload);
	gulp.watch(srcPath + '/js/**/*.js', browserSync.reload);
});

// build
gulp.task('build', ['clean', 'minify-css', 'scripts', 'img'], function(){
	var buildCss = gulp.src([
		srcPath + '/css/**/*.css',
	])
	.pipe(gulp.dest(distPath + '/css'));

	var buildFonts = gulp.src([
		srcPath + '/fonts/**/*',
	])
	.pipe(gulp.dest(distPath + '/fonts'));

	var buildJs = gulp.src([
		srcPath + '/js/**/*',
	])
	.pipe(gulp.dest(distPath + '/js'));

	var buildHtml = gulp.src([
		srcPath + '/**/*.html',
	])
	.pipe(gulp.dest(distPath));
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch']);