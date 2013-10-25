module.exports = (grunt) =>
    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'

        watch:
            coffee:
                files: ['public/coffee/**/*.coffee','!public/coffee/config.coffee']
                tasks: ['coffee:app']
                options:
                    spawn: false
            sass:
                files:  ['public/sass/**/*.{scss,sass}']
                tasks:   ['compass:app']

        compass:
            app:
                options:
                    sassDir: 'public/sass',
                    cssDir: 'public/assets/stylesheets'
                    noLineComments: false
                    outputStyle: 'expanded'
                    bundleExec: true

        coffee:
            app:
                options:
                    bare: true
                files: [
                    expand: true
                    cwd: 'public/coffee'
                    src: ['*.coffee', '**/*.coffee', 'config.coffee']
                    dest: 'public/assets/scripts/compiled'
                    ext: '.js'
                ]
            config:
                options:
                    bare: true
                files: [
                    expand: true
                    cwd: 'public/coffee'
                    src: ['config.coffee']
                    dest: 'public/assets/scripts'
                    ext: '.js'
                ]


        parallel:
            assetsDev:
                tasks: [
                    {
                        grunt: true
                        args: ['compass:app']
                    },
                    {
                        grunt: true
                        args: ['coffee:app']
                    }
                ]


    grunt.loadNpmTasks 'grunt-contrib-compass'
    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-parallel'

    grunt.registerTask 'default', ['compass']
    grunt.registerTask 'compile', ['parallel:assetsDev']