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

  var ns = 'app/wmes-orders-productTags';
  var nls = 'i18n!app/nls/wmes-orders-productTags';
  var canView = user.auth('ORDERS:MANAGE');
  var canManage = canView;

  router.map('/productTags', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        ns + '/ProductTagCollection',
        ns + '/views/ListView',
        nls
      ],
      function(ListPage, ProductTagCollection, ListView)
      {
        return new ListPage({
          navbarModuleName: 'orders',
          baseBreadcrumb: '#orders',
          pageClassName: 'page-max-flex',
          ListView: ListView,
          collection: new ProductTagCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/productTags/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        ns + '/ProductTag',
        ns + '/templates/details',
        nls
      ],
      function(DetailsPage, ProductTag, template)
      {
        return new DetailsPage({
          navbarModuleName: 'orders',
          baseBreadcrumb: '#orders',
          pageClassName: 'page-max-flex',
          detailsTemplate: template,
          model: new ProductTag({_id: req.params.id})
        });
      }
    );
  });

  router.map('/productTags;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        ns + '/ProductTag',
        ns + '/views/FormView',
        nls
      ],
      function(AddFormPage, ProductTag, FormView)
      {
        return new AddFormPage({
          navbarModuleName: 'orders',
          baseBreadcrumb: '#orders',
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new ProductTag()
        });
      }
    );
  });

  router.map('/productTags/:id;edit', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        ns + '/ProductTag',
        ns + '/views/FormView',
        nls
      ],
      function(EditFormPage, ProductTag, FormView)
      {
        return new EditFormPage({
          navbarModuleName: 'orders',
          baseBreadcrumb: '#orders',
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new ProductTag({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/productTags/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, ns + '/ProductTag', _, _, {
      navbarModuleName: 'orders',
      baseBreadcrumb: '#orders'
    })
  );
});
