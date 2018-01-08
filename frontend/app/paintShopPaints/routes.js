// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './PaintShopPaint',
  './PaintShopPaintCollection'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  PaintShopPaint,
  PaintShopPaintCollection
) {
  'use strict';

  var nls = 'i18n!app/nls/paintShopPaints';
  var canView = user.auth('PAINT_SHOP:VIEW');
  var canManage = user.auth('PAINT_SHOP:MANAGE');

  router.map('/paintShop/paints', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/paintShopPaints/pages/PaintShopPaintListPage'
      ],
      function(PaintShopPaintListPage)
      {
        return new PaintShopPaintListPage({
          collection: new PaintShopPaintCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/paintShop/paints/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/paintShopPaints/templates/details',
        nls
      ],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new PaintShopPaint({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/paintShop/paints;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/paintShopPaints/views/PaintShopPaintFormView',
        nls
      ],
      function(AddFormPage, PaintShopPaintFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: PaintShopPaintFormView,
          model: new PaintShopPaint()
        });
      }
    );
  });

  router.map('/paintShop/paints/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/paintShopPaints/views/PaintShopPaintFormView',
        nls
      ],
      function(EditFormPage, PaintShopPaintFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: PaintShopPaintFormView,
          model: new PaintShopPaint({_id: req.params.id})
        });
      }
    );
  });

  router.map('/paintShop/paints/:id;delete', canManage, _.partial(showDeleteFormPage, PaintShopPaint, _, _, {
    baseBreadcrumb: true
  }));
});
