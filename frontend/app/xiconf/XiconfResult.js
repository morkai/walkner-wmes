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
