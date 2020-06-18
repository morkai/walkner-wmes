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

  var nls = 'i18n!app/nls/kaizenAreas';
  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenAreas', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/kaizenAreas/KaizenAreaCollection',
        nls
      ],
      function(ListPage, KaizenAreaCollection)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          collection: new KaizenAreaCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'name',
            {id: 'active', className: 'is-min'},
            {id: 'position', className: 'is-min', tdClassName: 'is-number'}
          ]
        });
      }
    );
  });

  router.map('/kaizenAreas/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenAreas/KaizenArea',
        'app/kaizenAreas/templates/details',
        nls
      ],
      function(DetailsPage, KaizenArea, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          model: new KaizenArea({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/kaizenAreas;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenAreas/KaizenArea',
        'app/kaizenAreas/views/KaizenAreaFormView',
        nls
      ],
      function(AddFormPage, KaizenArea, KaizenAreaFormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenAreaFormView,
          model: new KaizenArea()
        });
      }
    );
  });

  router.map('/kaizenAreas/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenAreas/KaizenArea',
        'app/kaizenAreas/views/KaizenAreaFormView',
        nls
      ],
      function(EditFormPage, KaizenArea, KaizenAreaFormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenAreaFormView,
          model: new KaizenArea({_id: req.params.id})
        });
      }
    );
  });

  router.map('/kaizenAreas/:id;delete', canManage, _.partial(showDeleteFormPage, 'app/kaizenAreas/KaizenArea', _, _, {
    baseBreadcrumb: true
  }));
});
