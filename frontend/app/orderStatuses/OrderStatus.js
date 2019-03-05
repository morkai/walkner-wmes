// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  'app/core/util/colorLabel'
], function(
  Model,
  colorLabel
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
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.color = colorLabel(obj.color);

      return obj;
    }

  });
});
