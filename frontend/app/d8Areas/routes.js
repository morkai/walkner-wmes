// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var nls = 'i18n!app/nls/d8Areas';
  var model = 'app/d8Areas/D8Area';
  var canView = user.auth('D8:DICTIONARIES:VIEW');
  var canManage = user.auth('D8:DICTIONARIES:MANAGE');

  router.map('/d8/areas', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/d8Areas/D8AreaCollection',
        nls
      ],
      function(ListPage, D8AreaCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new D8AreaCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'name',
            {id: 'manager', className: 'is-min'},
            {id: 'position', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/d8/areas/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        model,
        'app/d8Areas/templates/details',
        nls
      ],
      function(DetailsPage, D8Area, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new D8Area({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/d8/areas;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        model,
        'app/d8Areas/views/D8AreaFormView',
        nls
      ],
      function(AddFormPage, D8Area, D8AreaFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: D8AreaFormView,
          model: new D8Area()
        });
      }
    );
  });

  router.map('/d8/areas/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        model,
        'app/d8Areas/views/D8AreaFormView',
        nls
      ],
      function(EditFormPage, D8Area, D8AreaFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: D8AreaFormView,
          model: new D8Area({_id: req.params.id})
        });
      }
    );
  });

  router.map('/d8/areas/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: true
  }));
});
