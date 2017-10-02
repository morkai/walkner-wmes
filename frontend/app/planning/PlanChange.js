// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Model'
], function(
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/planning/changes',

    clientUrlRoot: '#planning/changes',

    topicPrefix: 'planning.changes',

    privilegePrefix: 'PLANNING',

    nlsDomain: 'planning',

    getLabel: function()
    {
      return time.utc.format(this.attributes.date, 'LL');
    }

  });
});
