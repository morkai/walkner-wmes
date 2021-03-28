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

  var nls = 'i18n!app/nls/kaizenControlLists';
  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenControlLists', canView, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/kaizenOrders/dictionaries',
        nls
      ],
      function(ListPage, dictionaries)
      {
        return dictionaries.bind(new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          load: null,
          collection: dictionaries.controlLists,
          columns: [
            {id: 'name'},
            {id: 'active', className: 'is-min'}
          ]
        }));
      }
    );
  });

  router.map('/kaizenControlLists/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenControlLists/KaizenControlList',
        'app/kaizenControlLists/templates/details',
        nls
      ],
      function(DetailsPage, dictionaries, KaizenControlList, detailsTemplate)
      {
        var model = dictionaries.controlLists.get(req.params.id) || new KaizenControlList({_id: req.params.id});

        return dictionaries.bind(new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          model: model,
          detailsTemplate: detailsTemplate
        }));
      }
    );
  });

  router.map('/kaizenControlLists;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenControlLists/KaizenControlList',
        'app/kaizenControlLists/views/FormView',
        nls
      ],
      function(AddFormPage, dictionaries, KaizenControlList, FormView)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: FormView,
          model: new KaizenControlList()
        }));
      }
    );
  });

  router.map('/kaizenControlLists/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenControlLists/KaizenControlList',
        'app/kaizenControlLists/views/FormView',
        nls
      ],
      function(EditFormPage, dictionaries, KaizenControlList, FormView)
      {
        var model = dictionaries.controlLists.get(req.params.id) || new KaizenControlList({_id: req.params.id});

        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: FormView,
          model: model
        }));
      }
    );
  });

  router.map(
    '/kaizenControlLists/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/kaizenControlLists/KaizenControlList', _, _, {baseBreadcrumb: true})
  );
});
