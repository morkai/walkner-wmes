// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpVendorNc12sRoutes(app, module)
{
  var express = app[module.config.expressId];
  var auth = app[module.config.userId].auth;
  var VendorNc12 = app[module.config.mongooseId].model('VendorNc12');

  var canView = auth('VENDOR_NC12S:VIEW');
  var canManage = auth('VENDOR_NC12S:MANAGE');

  express.get('/vendorNc12s', canView, limitVendorView, express.crud.browseRoute.bind(null, app, VendorNc12));

  express.post('/vendorNc12s', canManage, limitVendorManage, express.crud.addRoute.bind(null, app, VendorNc12));

  express.get('/vendorNc12s/:id', canView, express.crud.readRoute.bind(null, app, VendorNc12));

  express.put('/vendorNc12s/:id', canManage, limitVendorManage, express.crud.editRoute.bind(null, app, VendorNc12));

  express.delete('/vendorNc12s/:id', canManage, express.crud.deleteRoute.bind(null, app, VendorNc12));

  function limitVendorView(req, res, next)
  {
    var user = req.session.user;

    if (user.vendor)
    {
      req.rql.selector.args.push({
        name: 'eq',
        args: ['vendor', user.vendor]
      });
    }

    next();
  }

  function limitVendorManage(req, res, next)
  {
    var user = req.session.user;

    if (user.vendor)
    {
      req.body.vendor = user.vendor;
    }

    next();
  }
};
