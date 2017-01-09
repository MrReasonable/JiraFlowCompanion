// Include Gulp
var gulp = require('gulp');
var merge = require('merge-stream');

// Include plugins
var plugins = require("gulp-load-plugins")({
	pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
	replaceString: /\bgulp[\-.]/
});



// Define default destination folder
var dest = './src/lib/';

var bowerPaths ={
    paths: {
        bowerDirectory: './bower_components',
        bowerrc: './bowerrc',
        bowerJson: './bower.json'
    }
}	
	
gulp.task('js', function() {

	var jsFiles = ['src/js/*'];

	plugins.bowerFiles(bowerPaths)//.concat(jsFiles))
		.pipe(plugins.filter('**/*.js'))
		.pipe(plugins.order([
			'd3/d3.js',
			'nvd3/build/nv.d3.js',
			'angular/angular.js',
			'jquery/dist/jquery.js',
			'*'
		]))
		.pipe(plugins.concat('deps.js'))
		//.pipe(plugins.uglify())
		.pipe(gulp.dest(dest + 'js'));

});

gulp.task('css', function() {

	var cssFiles = ['src/css/*'];
    var lessStream = plugins.bowerFiles(bowerPaths)
		.pipe(plugins.filter('**/*.less'))
        .pipe(plugins.less())
        .pipe(plugins.concat('less-files.css'))
		;

	var cssStream = plugins.bowerFiles(bowerPaths)
		.pipe(plugins.filter('**/*.css'))
        .pipe(plugins.concat('css-files.css'))
		;
	
	var mergedStream = merge(lessStream, cssStream)
        .pipe(plugins.concat('deps.css'))
        //.pipe(minify())
        .pipe(gulp.dest(dest + 'css'));

    return mergedStream;
	
	//plugins.bowerFiles(bowerPaths)
	//	.pipe(plugins.filter('**/*.css'))
	//	.pipe(plugins.concat('deps.css'))
	//	//.pipe(plugins.uglify())
	//	.pipe(gulp.dest(dest + 'css'));

});

gulp.task('default', ['css','js']);