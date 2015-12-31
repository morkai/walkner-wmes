// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/colorLabel'
], function(
  colorLabel
) {
  'use strict';

  return function(orderStatus)
  {
    return colorLabel({
      className: 'orderStatus',
      label: orderStatus._id,
      title: orderStatus.label,
      color: orderStatus.color
    });
  };
});
