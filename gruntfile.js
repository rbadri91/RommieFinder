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
  },
  postcss: {
      options: {
          processors: [
              require('autoprefixer')(),
              require('cssnext')(),
              require('precss')()
          ]
      },
      dist: {
        files: {
          'public/stylesheets/pageLayout.css' : 'public/stylesheets/pageLayout.css'
        }
      }
  }  
});
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['sass']);
}