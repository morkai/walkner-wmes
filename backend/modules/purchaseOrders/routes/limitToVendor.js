// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

module.exports = function limitToVendor(req, res, next)
{
  var user = req.session.user;

  if (!user.vendor)
  {
    return next();
  }

  var selectors = req.rql.selector.args;
  var vendorTerm = _.find(selectors, function(term)
  {
    return term.name === 'eq' && term.args[0] === 'vendor';
  });

  if (!vendorTerm)
  {
    vendorTerm = {
      name: 'eq',
      args: ['vendor', null]
    };

    selectors.unshift(vendorTerm);
  }

  vendorTerm.args[1] = user.vendor;

  next();
};
