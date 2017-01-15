// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

const PRODUCT_FAMILY_RE = /^[A-Z0-9]{6}/;

module.exports = function resolveProductName(orderData)
{
  if (!orderData)
  {
    return '';
  }

  const description = orderData.description || '';
  const name = orderData.name || '';

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
