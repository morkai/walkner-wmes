// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/colorLabel',
  'app/data/orderStatuses'
], function(
  colorLabel,
  orderStatuses
) {
  'use strict';

  return function(orderStatus)
  {
    if (typeof orderStatus === 'string')
    {
      var model = orderStatuses.get(orderStatus);

      if (!model)
      {
        orderStatus = {
          _id: orderStatus,
          label: orderStatus,
          color: '#999999'
        };
      }
      else
      {
        orderStatus = model.attributes;
      }
    }

    return colorLabel({
      className: 'orderStatus',
      label: orderStatus._id,
      title: orderStatus.label,
      color: orderStatus.color
    });
  };
});
