// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  './util/decorateProdLogEntry'
], function(
  Model,
  decorateProdLogEntry
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodLogEntries',

    clientUrlRoot: '#prodLogEntries',

    topicPrefix: 'prodLogEntries',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'prodLogEntries',

    serialize: function()
    {
      return decorateProdLogEntry(this);
    }

  });
});
