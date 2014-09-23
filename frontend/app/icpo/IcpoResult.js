// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
