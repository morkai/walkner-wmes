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

  var nls = 'i18n!app/nls/kaizenControlCategories';
  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenControlCategories', canView, function()
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
          collection: dictionaries.controlCategories,
          columns: [
            {id: 'shortName', className: 'is-min'},
            {id: 'fullName'},
            {id: 'active', className: 'is-min'}
          ]
        }));
      }
    );
  });

  router.map('/kaizenControlCategories/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenControlCategories/KaizenControlCategory',
        'app/kaizenControlCategories/templates/details',
        nls
      ],
      function(DetailsPage, dictionaries, KaizenControlCategory, detailsTemplate)
      {
        var model = dictionaries.controlCategories.get(req.params.id)
          || new KaizenControlCategory({_id: req.params.id});

        return dictionaries.bind(new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          model: model,
          detailsTemplate: detailsTemplate
        }));
      }
    );
  });

  router.map('/kaizenControlCategories;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenControlCategories/KaizenControlCategory',
        'app/kaizenControlCategories/views/FormView',
        nls
      ],
      function(AddFormPage, dictionaries, KaizenControlCategory, FormView)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: FormView,
          model: new KaizenControlCategory()
        }));
      }
    );
  });

  router.map('/kaizenControlCategories/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenControlCategories/KaizenControlCategory',
        'app/kaizenControlCategories/views/FormView',
        nls
      ],
      function(EditFormPage, dictionaries, KaizenControlCategory, FormView)
      {
        var model = dictionaries.controlCategories.get(req.params.id)
          || new KaizenControlCategory({_id: req.params.id});

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
    '/kaizenControlCategories/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/kaizenControlCategories/KaizenControlCategory', _, _, {baseBreadcrumb: true})
  );
});
