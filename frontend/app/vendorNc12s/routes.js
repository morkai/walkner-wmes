// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './VendorNc12Collection',
  './VendorNc12',
  'i18n!app/nls/vendorNc12s'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  VendorNc12Collection,
  VendorNc12
) {
  'use strict';

  var canView = user.auth('VENDOR_NC12S:VIEW');
  var canManage = user.auth('VENDOR_NC12S:MANAGE');

  router.map('/vendorNc12s', canView, function(req)
  {
    viewport.loadPage(['app/vendorNc12s/pages/VendorNc12ListPage'], function(VendorNc12ListPage)
    {
      return new VendorNc12ListPage({
        collection: new VendorNc12Collection(null, {rqlQuery: req.rql})
      });
    });
  });

  router.map('/vendorNc12s/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/vendorNc12s/templates/details'],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          detailsTemplate: detailsTemplate,
          model: new VendorNc12({_id: req.params.id})
        });
      }
    );
  });

  router.map('/vendorNc12s;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/vendorNc12s/views/VendorNc12FormView'],
      function(AddFormPage, VendorNc12FormView)
      {
        return new AddFormPage({
          FormView: VendorNc12FormView,
          model: new VendorNc12()
        });
      }
    );
  });

  router.map('/vendorNc12s/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/vendorNc12s/views/VendorNc12FormView'],
      function(EditFormPage, VendorNc12FormView)
      {
        return new EditFormPage({
          FormView: VendorNc12FormView,
          model: new VendorNc12({_id: req.params.id})
        });
      }
    );
  });

  router.map('/vendorNc12s/:id;delete', canManage, showDeleteFormPage.bind(null, VendorNc12));
});
