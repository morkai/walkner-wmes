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

  var nls = 'i18n!app/nls/kaizenCategories';
  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenCategories', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenCategories/KaizenCategoryCollection',
        nls
      ],
      function(ListPage, dictionaries, KaizenCategoryCollection)
      {
        return dictionaries.bind(new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          collection: new KaizenCategoryCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'name',
            {id: 'active', className: 'is-min'},
            {id: 'inNearMiss', className: 'is-min'},
            {id: 'inSuggestion', className: 'is-min'},
            {id: 'position', className: 'is-min', tdClassName: 'is-number'}
          ]
        }));
      }
    );
  });

  router.map('/kaizenCategories/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenCategories/KaizenCategory',
        'app/kaizenCategories/views/DetailsView',
        nls
      ],
      function(DetailsPage, dictionaries, KaizenCategory, DetailsView)
      {
        return dictionaries.bind(new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          DetailsView: DetailsView,
          model: new KaizenCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/kaizenCategories;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenCategories/KaizenCategory',
        'app/kaizenCategories/views/FormView',
        nls
      ],
      function(AddFormPage, dictionaries, KaizenCategory, FormView)
      {
        return dictionaries.bind(new AddFormPage({
          baseBreadcrumb: true,
          FormView: FormView,
          model: new KaizenCategory()
        }));
      }
    );
  });

  router.map('/kaizenCategories/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenCategories/KaizenCategory',
        'app/kaizenCategories/views/FormView',
        nls
      ],
      function(EditFormPage, dictionaries, KaizenCategory, FormView)
      {
        return dictionaries.bind(new EditFormPage({
          baseBreadcrumb: true,
          FormView: FormView,
          model: new KaizenCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/kaizenCategories/:id;delete', canManage, _.partial(
    showDeleteFormPage,
    'app/kaizenCategories/KaizenCategory', _, _, {
      baseBreadcrumb: true
    })
  );
});
