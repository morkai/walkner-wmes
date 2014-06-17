// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './VendorCollection',
  './Vendor',
  'i18n!app/nls/vendors'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  VendorCollection,
  Vendor
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/vendors', canView, function(req)
  {
    viewport.loadPage(['app/core/pages/ListPage'], function(ListPage)
    {
      return new ListPage({
        collection: new VendorCollection({rqlQuery: req.rql}),
        columns: ['_id', 'name']
      });
    });
  });

  router.map('/vendors/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/vendors/templates/details'],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          detailsTemplate: detailsTemplate,
          model: new Vendor({_id: req.params.id})
        });
      }
    );
  });

  router.map('/vendors;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/vendors/views/VendorFormView'],
      function(AddFormPage, VendorFormView)
      {
        return new AddFormPage({
          FormView: VendorFormView,
          model: new Vendor()
        });
      }
    );
  });

  router.map('/vendors/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/vendors/views/VendorFormView'],
      function(EditFormPage, VendorFormView)
      {
        return new EditFormPage({
          FormView: VendorFormView,
          model: new Vendor({_id: req.params.id})
        });
      }
    );
  });

  router.map('/vendors/:id;delete', canManage, showDeleteFormPage.bind(null, Vendor));

});
