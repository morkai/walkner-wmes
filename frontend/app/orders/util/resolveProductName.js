// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore'
], function(
  _
) {
  'use strict';

  var PRODUCT_FAMILY_RE = /^[A-Z0-9]{6}/;

  return function resolveProductName(orderData)
  {
    if (!orderData)
    {
      return '';
    }

    var description = orderData.description || '';
    var name = orderData.name || '';

    if (_.isEmpty(description))
    {
      return name.trim();
    }

    if (_.isEmpty(name))
    {
      return description.trim();
    }

    if (PRODUCT_FAMILY_RE.test(name))
    {
      return name.trim();
    }

    return (description || name).trim();
  };
});
