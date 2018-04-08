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

module.exports = {
	srcPath, distPath, vendorsPath, path
}