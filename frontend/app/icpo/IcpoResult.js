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

    urlRoot: '/icpo/results',

    clientUrlRoot: '#icpo/results',

    privilegePrefix: 'ICPO',

    nlsDomain: 'icpo',

    getDecoratedLog: function()
    {
      var log = this.get('log');

      return Array.isArray(log) ? log.map(decorateLogEntry) : [];
    },

    hasData: function(type)
    {
      var data = this.get(type + 'Data');

      return typeof data === 'string' && data.length !== 0;
    }

  });

});
