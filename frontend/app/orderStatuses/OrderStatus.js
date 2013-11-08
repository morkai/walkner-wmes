define([
  'app/core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/orderStatuses',

    clientUrlRoot: '#orderStatuses',

    labelProperty: '_id',

    nlsDomain: 'orderStatuses',
    
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
