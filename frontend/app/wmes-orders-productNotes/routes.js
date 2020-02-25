// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../i18n',
  '../user',
  '../core/View',
  '../core/util/showDeleteFormPage'
], function(
  _,
  router,
  viewport,
  t,
  user,
  View,
  showDeleteFormPage
) {
  'use strict';

  var ns = 'app/wmes-orders-productNotes';
  var nls = 'i18n!app/nls/wmes-orders-productNotes';
  var canView = user.auth('ORDERS:MANAGE');
  var canManage = canView;

  router.map('/productNotes', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        ns + '/ProductNoteCollection',
        ns + '/views/FilterView',
        ns + '/views/ListView',
        nls
      ],
      function(FilteredListPage, ProductNoteCollection, FilterView, ListView)
      {
        return new FilteredListPage({
          navbarModuleName: 'orders',
          baseBreadcrumb: '#orders',
          pageClassName: 'page-max-flex',
          FilterView: FilterView,
          ListView: ListView,
          collection: new ProductNoteCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/productNotes/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        ns + '/ProductNote',
        ns + '/templates/details',
        nls
      ],
      function(DetailsPage, ProductNote, template)
      {
        return new DetailsPage({
          navbarModuleName: 'orders',
          baseBreadcrumb: '#orders',
          pageClassName: 'page-max-flex',
          detailsTemplate: template,
          model: new ProductNote({_id: req.params.id})
        });
      }
    );
  });

  router.map('/productNotes;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        ns + '/ProductNote',
        ns + '/views/FormView',
        nls
      ],
      function(AddFormPage, ProductNote, FormView)
      {
        return new AddFormPage({
          navbarModuleName: 'orders',
          baseBreadcrumb: '#orders',
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new ProductNote()
        });
      }
    );
  });

  router.map('/productNotes/:id;edit', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        ns + '/ProductNote',
        ns + '/views/FormView',
        nls
      ],
      function(EditFormPage, ProductNote, FormView)
      {
        return new EditFormPage({
          navbarModuleName: 'orders',
          baseBreadcrumb: '#orders',
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new ProductNote({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/productNotes/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, ns + '/ProductNote', _, _, {
      navbarModuleName: 'orders',
      baseBreadcrumb: '#orders'
    })
  );
});
