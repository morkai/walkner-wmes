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

    if (/^[A-Z]/.test(orderData.nc12))
    {
      return (orderData.description || orderData.name || '').trim();
    }

    return (orderData.name || orderData.description || '').trim();
  };
});
