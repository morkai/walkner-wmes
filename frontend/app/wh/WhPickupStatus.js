// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    url: '/old/wh/pickupStatus',

    topicPrefix: 'old.wh.pickupStatus',

    privilegePrefix: 'WH',

    nlsDomain: 'wh',

    update: function(newData)
    {
      if (newData.updatedAt > this.get('updatedAt'))
      {
        this.set(newData);
      }
    }

  });
});
