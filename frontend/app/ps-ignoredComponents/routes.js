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

  var nls = 'i18n!app/nls/ps-ignoredComponents';
  var canView = user.auth('PAINT_SHOP:VIEW');
  var canManage = user.auth('PAINT_SHOP:MANAGE');

  router.map('/paintShop/ignoredComponents/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/ps-ignoredComponents/PsIgnoredComponent',
        'app/ps-ignoredComponents/templates/details',
        nls
      ],
      function(DetailsPage, PsIgnoredComponent, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: '#paintShop/' + (window.WMES_LAST_PAINT_SHOP_DATE || '0d'),
          model: new PsIgnoredComponent({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/paintShop/ignoredComponents;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/ps-ignoredComponents/PsIgnoredComponent',
        'app/ps-ignoredComponents/views/FormView',
        nls
      ],
      function(AddFormPage, PsIgnoredComponent, FormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: '#paintShop/' + (window.WMES_LAST_PAINT_SHOP_DATE || '0d'),
          FormView: FormView,
          model: new PsIgnoredComponent()
        });
      }
    );
  });

  router.map('/paintShop/ignoredComponents/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/ps-ignoredComponents/PsIgnoredComponent',
        'app/ps-ignoredComponents/views/FormView',
        nls
      ],
      function(EditFormPage, PsIgnoredComponent, FormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: '#paintShop/' + (window.WMES_LAST_PAINT_SHOP_DATE || '0d'),
          FormView: FormView,
          model: new PsIgnoredComponent({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/paintShop/ignoredComponents/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/ps-ignoredComponents/PsIgnoredComponent', _, _, {
      baseBreadcrumb: true
    })
  );
});
