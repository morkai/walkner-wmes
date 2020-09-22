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

  var nls = 'i18n!app/nls/kaizenProductFamilies';
  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenProductFamilies', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/kaizenProductFamilies/KaizenProductFamilyCollection',
        nls
      ],
      function(ListPage, KaizenProductFamilyCollection)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          collection: new KaizenProductFamilyCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            {id: 'name', className: 'is-min'},
            {id: 'active', className: 'is-min'},
            'owners',
            'mrps',
            {id: 'position', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/kaizenProductFamilies/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenProductFamilies/KaizenProductFamily',
        'app/kaizenProductFamilies/templates/details',
        nls
      ],
      function(DetailsPage, dictionaries, KaizenProductFamily, detailsTemplate)
      {
        return dictionaries.bind(new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          model: new KaizenProductFamily({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        }));
      }
    );
  });

  router.map('/kaizenProductFamilies;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenProductFamilies/KaizenProductFamily',
        'app/kaizenProductFamilies/views/KaizenProductFamilyFormView',
        nls
      ],
      function(AddFormPage, dictionaries, KaizenProductFamily, KaizenProductFamilyFormView)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenProductFamilyFormView,
          model: new KaizenProductFamily()
        }));
      }
    );
  });

  router.map('/kaizenProductFamilies/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenProductFamilies/KaizenProductFamily',
        'app/kaizenProductFamilies/views/KaizenProductFamilyFormView',
        nls
      ],
      function(EditFormPage, dictionaries, KaizenProductFamily, KaizenProductFamilyFormView)
      {
        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenProductFamilyFormView,
          model: new KaizenProductFamily({_id: req.params.id})
        }));
      }
    );
  });

  router.map(
    '/kaizenProductFamilies/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/kaizenProductFamilies/KaizenProductFamily', _, _, {baseBreadcrumb: true})
  );
});
