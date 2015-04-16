// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './LicenseCollection',
  './License',
  'i18n!app/nls/licenses'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  LicenseCollection,
  License
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('LICENSES:MANAGE');

  router.map('/licenses', canView, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/FilteredListPage', 'app/licenses/views/LicenseFilterView', 'app/licenses/views/LicenseListView'],
      function(FilteredListPage, LicenseFilterView, LicenseListView)
      {
        return new FilteredListPage({
          FilterView: LicenseFilterView,
          ListView: LicenseListView,
          collection: new LicenseCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/licenses/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/licenses/templates/details'],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          detailsTemplate: detailsTemplate,
          model: new License({_id: req.params.id})
        });
      }
    );
  });

  router.map('/licenses;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/licenses/views/LicenseFormView'],
      function(AddFormPage, LicenseFormView)
      {
        return new AddFormPage({
          FormView: LicenseFormView,
          model: new License()
        });
      }
    );
  });

  router.map('/licenses/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/licenses/views/LicenseFormView'],
      function(EditFormPage, LicenseFormView)
      {
        return new EditFormPage({
          FormView: LicenseFormView,
          model: new License({_id: req.params.id})
        });
      }
    );
  });

  router.map('/licenses/:id;delete', canManage, showDeleteFormPage.bind(null, License));

});
