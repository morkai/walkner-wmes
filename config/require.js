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
  'd3': 'vendor/d3/d3.v3',
  'd3.timeline': 'vendor/d3/d3.timeline',
  'visibly': 'vendor/visibly',
  'highcharts': 'vendor/highcharts-custom',
  'zeroclipboard': 'vendor/zeroclipboard/ZeroClipboard',
  'screenfull': 'vendor/screenfull',
  'datatables': 'vendor/datatables/media/js/jquery.dataTables',
  'datatables-fixedcolumns': 'vendor/datatables/extensions/FixedColumns/js/dataTables.fixedColumns',
  'datatables-fixedheader': 'vendor/datatables/extensions/FixedHeader/js/dataTables.fixedHeader',
  'datatables-scroller': 'vendor/datatables/extensions/Scroller/js/dataTables.scroller',
  'datatables-tabletools': 'vendor/datatables/extensions/TableTools/js/dataTables.tableTools',
  'jquery.stickytableheaders': 'vendor/jquery.stickytableheaders',
  'highlight': 'vendor/highlight/highlight.pack',
  'Sortable': 'vendor/Sortable',
  'deployJava': 'vendor/deployJava',
  'interact': 'vendor/interact',
  'dragscroll': 'vendor/dragscroll',
  'hammer': 'vendor/hammer'
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
  'visibly': {
    exports: 'visibly'
  },
  'highcharts': {
    deps: ['jquery'],
    exports: 'Highcharts'
  },
  'screenfull': {
    exports: 'screenfull'
  },
  'jquery.stickytableheaders': ['jquery'],
  'highlight': {
    exports: 'hljs'
  },
  'deployJava': {
    exports: 'deployJava'
  }
};

exports.buildPaths = exports.paths;
exports.buildShim = exports.shim;
