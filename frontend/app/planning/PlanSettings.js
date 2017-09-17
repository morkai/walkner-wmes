// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/Model'
], function(
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/planning/settings',

    clientUrlRoot: '#planning/settings',

    topicPrefix: 'planning.settings',

    privilegePrefix: 'PLANNING',

    nlsDomain: 'planning',

    parse: function(res)
    {
      res._id = time.utc.format(this.id, 'YYYY-MM-DD');

      return res;
    },

    getLabel: function()
    {
      return time.utc.format(this.id, 'LL');
    }

  });
});
