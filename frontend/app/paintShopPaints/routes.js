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

  var nls = 'i18n!app/nls/paintShopPaints';
  var canView = user.auth('PAINT_SHOP:VIEW');
  var canManage = user.auth('PAINT_SHOP:MANAGE');

  router.map('/paintShop/paints/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/paintShopPaints/PaintShopPaint',
        'app/paintShopPaints/templates/details',
        nls
      ],
      function(DetailsPage, PaintShopPaint, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: '#paintShop/' + (window.WMES_LAST_PAINT_SHOP_DATE || '0d'),
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
        'app/paintShopPaints/PaintShopPaint',
        'app/paintShopPaints/views/PaintShopPaintFormView',
        nls
      ],
      function(AddFormPage, PaintShopPaint, PaintShopPaintFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: '#paintShop/' + (window.WMES_LAST_PAINT_SHOP_DATE || '0d'),
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
        'app/paintShopPaints/PaintShopPaint',
        'app/paintShopPaints/views/PaintShopPaintFormView',
        nls
      ],
      function(EditFormPage, PaintShopPaint, PaintShopPaintFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: '#paintShop/' + (window.WMES_LAST_PAINT_SHOP_DATE || '0d'),
          FormView: PaintShopPaintFormView,
          model: new PaintShopPaint({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/paintShop/paints/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/paintShopPaints/PaintShopPaint', _, _, {
      baseBreadcrumb: true
    })
  );
});
