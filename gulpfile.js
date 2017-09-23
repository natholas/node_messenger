var gulp = require('gulp');
var ts = require('gulp-typescript');
var nodemon = require('gulp-nodemon');
var  spawn = require('child_process').spawn;
var node;

gulp.task('server', ['ts'], function () {
  if (node) node.kill()
  node = spawn('node', ['build/main.js'], { stdio: 'inherit' })
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
})

gulp.task('ts', function () {
  return gulp.src('app/main.ts')
    .pipe(ts({
      noImplicitAny: true,
      outFile: 'main.js'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('watch', ['server'], function() {
  gulp.watch('app/main.ts', ['server'])
});

gulp.task('default', ['watch']);



process.on('exit', function () {
  if (node) node.kill();
});