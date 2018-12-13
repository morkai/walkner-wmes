// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './CategoryCollection',
  './Category'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  CategoryCollection,
  Category
) {
  'use strict';

  var nls = 'i18n!app/nls/wmes-fap-categories';
  var canView = user.auth('FAP:MANAGE');
  var canManage = canView;

  router.map('/fap/categories', canView, function(req)
  {
    viewport.loadPage(['app/core/pages/ListPage', nls], function(ListPage)
    {
      return new ListPage({
        baseBreadcrumb: '#fap/entries',
        collection: new CategoryCollection(null, {rqlQuery: req.rql}),
        columns: [
          {id: 'name', className: 'is-min'},
          {id: 'active', className: 'is-min'},
          '-'
        ]
      });
    });
  });

  router.map('/fap/categories/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/wmes-fap-categories/templates/details', nls],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: '#fap/entries',
          model: new Category({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/fap/categories;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wmes-fap-categories/views/FormView',
        'i18n!app/nls/users',
        nls
      ],
      function(AddFormPage, FormView)
      {
        return new AddFormPage({
          baseBreadcrumb: '#fap/entries',
          FormView: FormView,
          model: new Category()
        });
      }
    );
  });

  router.map('/fap/categories/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wmes-fap-categories/views/FormView',
        'i18n!app/nls/users',
        nls
      ],
      function(EditFormPage, FormView)
      {
        return new EditFormPage({
          baseBreadcrumb: '#fap/entries',
          FormView: FormView,
          model: new Category({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/fap/categories/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/wmes-fap-categories/Category', _, _, {
      baseBreadcrumb: '#fap/entries'
    })
  );
});
