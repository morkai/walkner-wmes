// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Collection',
  './OrderStatus'
], function(
  Collection,
  OrderStatus
) {
  'use strict';

  return Collection.extend({

    model: OrderStatus,

    rqlQuery: 'select(label,color)&sort(_id)',

    findAndFill: function(idList)
    {
      var collection = this;

      return !Array.isArray(idList) ? [] : idList.map(function(id)
      {
        var orderStatus = collection.get(id);

        if (!orderStatus)
        {
          orderStatus = new OrderStatus({_id: id});
        }

        return orderStatus.toJSON();
      });
    }

  });
});
