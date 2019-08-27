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

  var nls = 'i18n!app/nls/cags';
  var canView = user.auth('REPORTS:VIEW', 'REPORTS:9:VIEW');
  var canManage = user.auth('REPORTS:MANAGE');

  router.map('/cags', canView, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/cags/CagCollection', nls],
      function(ListPage, CagCollection)
      {
        return new ListPage({
          baseBreadcrumb: '#reports/9',
          collection: new CagCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'name'
          ]
        });
      }
    );
  });

  router.map('/cags/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/cags/Cag', 'app/cags/templates/details', nls],
      function(DetailsPage, Cag, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: '#reports/9',
          model: new Cag({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/cags;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/cags/Cag', 'app/cags/templates/form', nls],
      function(AddFormPage, Cag, formTemplate)
      {
        return new AddFormPage({
          baseBreadcrumb: '#reports/9',
          model: new Cag(),
          formTemplate: formTemplate
        });
      }
    );
  });

  router.map('/cags/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/cags/Cag', 'app/cags/templates/form', nls],
      function(EditFormPage, Cag, formTemplate)
      {
        return new EditFormPage({
          baseBreadcrumb: '#reports/9',
          model: new Cag({_id: req.params.id}),
          formTemplate: formTemplate
        });
      }
    );
  });

  router.map('/cags/:id;delete', canManage, showDeleteFormPage.bind(null, 'app/cags/Cag'));
});
