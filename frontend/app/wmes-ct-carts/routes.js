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

  var nls = 'i18n!app/nls/wmes-ct-carts';
  var model = 'app/wmes-ct-carts/Cart';
  var canView = user.auth('PROD_DATA:MANAGE');
  var canManage = canView;
  var baseBreadcrumb = '#ct';

  router.map('/ct/carts', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/wmes-ct-carts/CartCollection',
        nls
      ],
      function(ListPage, CartCollection)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          collection: new CartCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: 'description', className: 'is-min'},
            {id: 'cards', tdClassName: 'text-fixed'}
          ]
        });
      }
    );
  });

  router.map('/ct/carts/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        model,
        'app/wmes-ct-carts/templates/details',
        nls
      ],
      function(DetailsPage, Cart, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          model: new Cart({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/ct/carts;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        model,
        'app/wmes-ct-carts/views/FormView',
        nls
      ],
      function(AddFormPage, Cart, FormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Cart()
        });
      }
    );
  });

  router.map('/ct/carts/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        model,
        'app/wmes-ct-carts/views/FormView',
        nls
      ],
      function(EditFormPage, Cart, FormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Cart({_id: req.params.id})
        });
      }
    );
  });

  router.map('/ct/carts/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: baseBreadcrumb
  }));
});
