// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/orderStatuses',

    clientUrlRoot: '#orderStatuses',

    topicPrefix: 'orderStatuses',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'orderStatuses',

    labelAttribute: '_id',
    
    defaults: {
      label: null,
      color: '#999999'
    },

    toJSON: function()
    {
      var orderStatus = Model.prototype.toJSON.call(this);

      if (!orderStatus.label)
      {
        orderStatus.label = orderStatus._id;
      }

      return orderStatus;
    }

  });
});
