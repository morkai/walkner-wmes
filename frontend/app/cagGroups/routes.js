// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './CagGroup'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var nls = 'i18n!app/nls/cagGroups';
  var canView = user.auth('REPORTS:VIEW', 'REPORTS:9:VIEW');
  var canManage = user.auth('REPORTS:MANAGE');

  router.map('/cagGroups', canView, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/cagGroups/CagGroupCollection', nls],
      function(ListPage, CagGroupCollection)
      {
        return new ListPage({
          baseBreadcrumb: '#reports/9',
          collection: new CagGroupCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: 'name', className: 'is-min'},
            {id: 'color', className: 'is-min'},
            'cags'
          ]
        });
      }
    );
  });

  router.map('/cagGroups/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/cagGroups/CagGroup', 'app/cagGroups/templates/details', nls],
      function(DetailsPage, CagGroup, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: '#reports/9',
          model: new CagGroup({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/cagGroups;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/cagGroups/CagGroup', 'app/cagGroups/views/CagGroupFormView', nls],
      function(AddFormPage, CagGroup, CagGroupFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: '#reports/9',
          FormView: CagGroupFormView,
          model: new CagGroup()
        });
      }
    );
  });

  router.map('/cagGroups/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/cagGroups/CagGroup', 'app/cagGroups/views/CagGroupFormView', nls],
      function(EditFormPage, CagGroup, CagGroupFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: '#reports/9',
          FormView: CagGroupFormView,
          model: new CagGroup({_id: req.params.id})
        });
      }
    );
  });

  router.map('/cagGroups/:id;delete', canManage, showDeleteFormPage.bind(null, 'app/cagGroups/CagGroup'));
});
