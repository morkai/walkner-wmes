define([
  'app/core/Collection',
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

      return idList.map(function(id)
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
