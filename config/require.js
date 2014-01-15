'use strict';

exports.paths = {
  'text': 'vendor/require/text',
  'i18n': 'vendor/require/i18n',
  'domReady': 'vendor/require/domReady',
  'underscore': 'vendor/underscore',
  'jquery': 'vendor/jquery',
  'backbone': 'vendor/backbone',
  'backbone.layout': 'vendor/backbone.layoutmanager',
  'moment': 'vendor/moment/moment',
  'moment-lang': 'vendor/moment/lang',
  'moment-timezone': 'vendor/moment/moment-timezone',
  'moment-timezone-data': 'vendor/moment/moment-timezone-data',
  'bootstrap': 'vendor/bootstrap/js/bootstrap',
  'bootstrap-colorpicker': 'vendor/bootstrap-colorpicker/js/bootstrap-colorpicker',
  'socket.io': 'vendor/socket.io',
  'h5.pubsub': 'vendor/h5.pubsub',
  'h5.rql': 'vendor/h5.rql',
  'form2js': 'vendor/form2js',
  'js2form': 'vendor/js2form',
  'reltime': 'vendor/reltime',
  'select2': 'vendor/select2/select2',
  'select2-lang': 'vendor/select2-lang',
  'd3': 'vendor/d3.v3',
  'visibly': 'vendor/visibly',
  'highcharts': 'vendor/highcharts/js/highcharts.src',
  'highcharts-noData': 'vendor/highcharts/js/modules/no-data-to-display.src'
};

exports.shim = {
  'underscore': {
    exports: '_'
  },
  'backbone': {
    deps: ['underscore', 'jquery'],
    exports: 'Backbone'
  },
  'bootstrap': ['jquery'],
  'bootstrap-colorpicker': ['bootstrap'],
  'reltime': {
    exports: 'reltime'
  },
  'select2': {
    deps: ['jquery'],
    exports: 'Select2'
  },
  'd3': {
    exports: 'd3'
  },
  'visibly': {
    exports: 'visibly'
  },
  'highcharts': {
    deps: ['jquery'],
    exports: 'Highcharts'
  },
  'highcharts-noData': {
    deps: ['highcharts']
  }
};

exports.buildPaths = exports.paths;
exports.buildShim = exports.shim;
