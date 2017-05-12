module.exports = function(grunt) {
  grunt.initConfig ({
    sass: {
      dist: {
        options: {
          includePaths: require('node-bourbon').includePaths
        },
        files: {
          'public/stylesheets/pageLayout.css' : 'sass/pageLayout.scss'
        }
      }
    },
  watch: {
    source: {
      files: ['sass/**/*.scss'],
      tasks: ['sass'],
      options: {
        livereload: true,
      }
    }
  }  
});
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['sass']);
}