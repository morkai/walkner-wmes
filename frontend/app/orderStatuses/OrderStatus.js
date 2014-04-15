// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
