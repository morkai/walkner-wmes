// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const requirejsConfig = require('./config/require');

module.exports = grunt =>
{
  const include = [
    'select2-lang/en',
    'select2-lang/pl',
    'moment-lang/en',
    'moment-lang/pl'
  ];
  const modules = [
    {name: 'pos-main', include},
    {name: 'wmes-main', include},
    {name: 'wmes-pila-main', include},
    {name: 'wmes-docs', include},
    {name: 'wmes-operator', include},
    {name: 'wmes-heff', include},
    {name: 'wmes-ps-queue', include},
    {name: 'wmes-ps-load', include},
    {name: 'wmes-wiring', include},
    {name: 'wmes-drilling', include},
    {name: 'wmes-wh-pickup', include},
    {name: 'wmes-wh-problems', include},
    {name: 'wmes-wh-delivery-components', include},
    {name: 'wmes-wh-delivery-packaging', include},
    {name: 'wmes-wh-delivery-ps', include},
    {name: 'wmes-isa', include},
    {name: 'wmes-trw', include},
    {name: 'wmes-gft', include}
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      frontendBuild: [
        './build/frontend',
        './frontend-build'
      ],
      frontendBuilt: [
        './build/frontend',
        './frontend-build/**/*.ejs',
        './frontend-build/**/nls/*.json'
      ],
      scripts: [
        './build/scripts'
      ],
      build: [
        './build'
      ]
    },
    eslint: {
      backend: {
        src: [
          './backend/**/*.js'
        ],
        options: {
          configFile: '.eslintrc.json'
        }
      },
      frontend: {
        src: [
          './frontend/app/**/*.js'
        ],
        options: {
          configFile: 'frontend/.eslintrc.json'
        }
      }
    },
    copy: {
      frontend: {
        expand: true,
        cwd: './frontend',
        src: '**',
        dest: './build/frontend'
      }
    },
    ejsAmd: {
      frontend: {
        expand: true,
        cwd: './build/frontend',
        src: '**/*.ejs',
        dest: './build/frontend',
        ext: '.js',
        options: {
          helpers: require('./config/wmes-frontend').express.ejsAmdHelpers
        }
      }
    },
    messageformatAmdLocale: {
      frontend: {
        options: {
          locales: ['en', 'pl'],
          destDir: './build/frontend/app/nls/locale'
        }
      }
    },
    messageformatAmd: {
      frontend: {
        expand: true,
        cwd: './build/frontend',
        src: 'app/**/nls/*.json',
        ext: '.js',
        options: {
          destDir: './build/frontend/app/nls',
          localeModulePrefix: 'app/nls/locale/',
          resolveLocaleAndDomain: function(jsonFile)
          {
            const matches = jsonFile.match(/app\/(.*?)\/nls\/(.*?)\.json/);

            if (matches === null)
            {
              throw new Error(`Invalid MessageFormat JSON file: ${jsonFile}`);
            }

            return {
              locale: matches[2],
              domain: matches[1]
            };
          }
        }
      }
    },
    requirejs: {
      frontend: {
        options: {
          baseUrl: './build/frontend',
          dir: './frontend-build',
          optimize: 'none',
          optimizeCss: 'standard',
          buildCSS: true,
          modules,
          packages: requirejsConfig.packages,
          paths: requirejsConfig.buildPaths,
          shim: requirejsConfig.buildShim,
          locale: 'pl'
        }
      }
    },
    uglify: {
      options: {
        ecma: 5,
        compress: {
          drop_console: false // eslint-disable-line camelcase
        }
      },
      frontend: {
        files: [{
          expand: true,
          cwd: './frontend-build',
          src: '**/*.js',
          dest: './frontend-build'
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-uglify-es-multicore');
  grunt.loadNpmTasks('grunt-ejs-amd');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-messageformat-amd');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('default', [
    'clean',
    'eslint:backend',
    'eslint:frontend'
  ]);

  grunt.registerTask('build-frontend', [
    'clean:frontendBuild',
    'copy:frontend',
    'ejsAmd:frontend',
    'messageformatAmdLocale:frontend',
    'messageformatAmd:frontend',
    'requirejs:frontend',
    'uglify:frontend',
    'clean:frontendBuilt'
  ]);

  grunt.registerTask('build-all', [
    'clean:build',
    'build-frontend'
  ]);
};
