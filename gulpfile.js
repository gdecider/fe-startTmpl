'use strict';

var gulp        = require('gulp');
var sass        = require('gulp-sass');
var browserSync = require('browser-sync').create();
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
var connectPHP  = require('gulp-connect-php');
var bsreload    = browserSync.reload;

var srcPath = './src';
var distPath = './dist';
var vendorsPath = './node_modules';

// === NEW
var path = {
	html: {
		src: [srcPath + '/**/*.html', srcPath + '/**/*.php'],
		dest: srcPath,
		dist: distPath
	},
	sass: {
		src: [srcPath + '/sass/**/*.+(sass|scss)'],
		dest: srcPath + '/css',
		dist: distPath + '/css'
	},
	css: {
		src: [srcPath + '/css/**/*.css'],
		dest: srcPath + '/css',
		dist: distPath + '/css'
	},
	js: {
		src: [srcPath + '/js/**/*'],
		dest: srcPath + '/js',
		dist: distPath + '/js'
	},
	img: {
		src: [srcPath + '/img/**/*'],
		dest: srcPath + '/img',
		dist: distPath + '/img'
	},
	font: {
		src: [srcPath + '/fonts/**/*'],
		dest: srcPath + '/fonts',
		dist: distPath + '/fonts'
	},
	vendor: {
		js: [
			vendorsPath + '/jquery/dist/jquery.min.js',
			vendorsPath + '/slick-carousel/slick/slick.js',
			vendorsPath + '/@fancyapps/fancybox/dist/jquery.fancybox.js',
		],
		css: [
			srcPath + '/css/vendors/**/*',
			vendorsPath + '/slick-carousel/slick/slick.css',
			vendorsPath + '/@fancyapps/fancybox/dist/jquery.fancybox.css',
			//vendorsPath + '/vendor-name/path-to/some.css',
		],
		sass: [
			srcPath + '/sass-vendors/bootstrap4-grid.scss',
			//vendorsPath + '/vendor-name/path-to/some.scss',
		],
		jsFileName: 'vendors.min.js',
		cssFileName: 'vendors.min.css',
		sassTmpFolder: 'vendors',
	}
};

// ф-я для перехвата ошибок
var onError = function (err) {
    notify({
		title: 'Gulp Task Error',
		message: '!!!ERROR!!! Check the console.'
	}).write(err);

	console.log(err.toString());

	this.emit('end');
}

// WATCHER
gulp.task('watch', ['pre-build'], function(){
	gulp.watch(path.sass.src, ['assets:sass']);
	gulp.watch(path.html.src, ['assets:html']);
	gulp.watch(path.js.src, ['assets:js']);
});

// SYNC HTML (no php)
gulp.task('sync:html', ['watch'], function () {
    browserSync.init({
        server: {
            baseDir: srcPath
        },
        notify: false,
        open: true
    });
});

// SYNC ALL HTML + PHP
gulp.task('sync', ['watch'], function () {
    connectPHP.server({base: srcPath, keepalive: true, hostname: 'localhost', port: 8888, open: false});
    browserSync.init({
        proxy: '127.0.0.1:8888',
        notify: false,
        open: true
    });
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['build']);

// TASK pre-build
gulp.task('pre-build', [
	'vendor:js', 'vendor:css:after',
	'assets:sass', 'assets:js',
]);

// TASK build
gulp.task('build', ['dist:clean', 'pre-build', 'assets:img'], function(){
	var buildCss = gulp.src(path.css.src)
	.pipe(gulp.dest(path.css.dist));

	var buildFonts = gulp.src(path.font.src)
	.pipe(gulp.dest(path.font.dist));

	var buildJs = gulp.src(path.js.src)
	.pipe(gulp.dest(path.js.dist));

	var buildHtml = gulp.src(path.html.src)
	.pipe(gulp.dest(path.html.dist));
});

// TASK clean build dir
gulp.task('dist:clean', function(){
	return del.sync([
		distPath
	]);
});

// TASK clear cache
gulp.task('clear', function(){
	return cache.clearAll();
});

// TASK vendor:clean
gulp.task('vendor:clean', function(){
	return del.sync([
		path.css.dest + '/' + path.vendor.cssFileName,
		path.js.dest + '/' + path.vendor.jsFileName,
	]);
});

// TASK vendor:js
gulp.task('vendor:js', ['vendor:clean'], function(){
	return gulp.src(path.vendor.js)
		.pipe(concat(path.vendor.jsFileName))
		.pipe(uglify())
		.pipe(gulp.dest(path.js.dest));
		//.pipe(bsreload({stream: true}));
});

// TASK vendor:sass
gulp.task('vendor:sass', function(){
	return gulp.src(path.vendor.sass)
		.pipe(plumber({ errorHandle: onError }))
		.pipe(sass())
		.on('error', onError)
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
		.pipe(gulp.dest(path.sass.dest+'/'+path.vendor.sassTmpFolder))
		.pipe(notify({
	        title   : 'Gulp Task Complete',
	        message : 'Vendor Styles have been compiled'
	    }))
		.pipe(bsreload({stream: true}));
});

// TASK vendor:css
gulp.task('vendor:css', ['vendor:clean', 'vendor:sass'], function(){
	return gulp.src(path.vendor.css)
		.pipe(sourcemaps.init())
		.pipe(concat(path.vendor.cssFileName))
		.pipe(cleanCss())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.css.dest));
});

// TASK vendor:css:after
gulp.task('vendor:css:after', ['vendor:css'], function(){
	return del.sync([
		path.sass.dest+'/'+path.vendor.sassTmpFolder
	]);
});

// TASK assets:sass
gulp.task('assets:sass', function(){
	return gulp.src(path.sass.src)
		.pipe(plumber({ errorHandle: onError }))
		.pipe(sass())
		.on('error', onError)
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
		.pipe(gulp.dest(path.sass.dest))
		.pipe(notify({
	        title   : 'Gulp Task Complete',
	        message : 'Styles have been compiled'
	    }))
		.pipe(bsreload({stream: true}));
});

// TASK assets:html
gulp.task('assets:html', function(){
	return gulp.src(path.html.src)
		.pipe(bsreload({stream: true}));
});

// TASK assets:js
gulp.task('assets:js', function(){
	return gulp.src(path.js.src)
		.pipe(bsreload({stream: true}));
});

// TASK assets:img minify
gulp.task('assets:img', function(){
	return gulp.src(path.img.src)
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPluggins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest(path.img.dist));
});

// === OLD

// uglify css libs
// gulp.task('minify-css', ['sass'], function(){
// 	return gulp.src([
// 		srcPath + '/css/**/*.css',
// 		'!'+srcPath + '/css/**/*.min.css',
// 	])
// 	.pipe(sourcemaps.init())
// 	.pipe(cleanCss())
// 	.pipe(sourcemaps.write())
// 	.pipe(rename({suffix: '.min'}))
// 	.pipe(gulp.dest(srcPath + '/css'));
// });