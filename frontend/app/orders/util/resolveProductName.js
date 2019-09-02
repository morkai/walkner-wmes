// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  return function resolveProductName(orderData)
  {
    if (!orderData)
    {
      return '';
    }

    return (orderData.name || orderData.description || '').trim();
  };
});
