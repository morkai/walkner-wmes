// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  './util/decorateLogEntry'
], function(
  Model,
  decorateLogEntry
) {
  'use strict';

  return Model.extend({

    urlRoot: '/xiconf/results',

    clientUrlRoot: '#xiconf/results',

    privilegePrefix: 'XICONF',

    nlsDomain: 'xiconf',

    getDecoratedLog: function()
    {
      var log = this.get('log');

      return Array.isArray(log) ? log.map(decorateLogEntry) : [];
    },

    hasFeatureData: function()
    {
      var feature = this.get('feature');

      return typeof feature === 'string' && feature.length !== 0;
    }

  });

});
