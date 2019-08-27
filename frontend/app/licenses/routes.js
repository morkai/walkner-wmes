// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var css = 'css!app/licenses/assets/main';
  var nls = 'i18n!app/nls/licenses';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('LICENSES:MANAGE');

  router.map('/licenses', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/licenses/LicenseCollection',
        'app/licenses/views/LicenseFilterView',
        'app/licenses/views/LicenseListView',
        css,
        nls
      ],
      function(FilteredListPage, LicenseCollection, LicenseFilterView, LicenseListView)
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
      ['app/core/pages/DetailsPage', 'app/licenses/License', 'app/licenses/templates/details', css, nls],
      function(DetailsPage, License, detailsTemplate)
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
      ['app/core/pages/AddFormPage', 'app/licenses/License', 'app/licenses/views/LicenseFormView', nls],
      function(AddFormPage, License, LicenseFormView)
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
      ['app/core/pages/EditFormPage', 'app/licenses/License', 'app/licenses/views/LicenseFormView', nls],
      function(EditFormPage, License, LicenseFormView)
      {
        return new EditFormPage({
          FormView: LicenseFormView,
          model: new License({_id: req.params.id})
        });
      }
    );
  });

  router.map('/licenses/:id;delete', canManage, showDeleteFormPage.bind(null, 'app/licenses/License'));
});
