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

  var nls = 'i18n!app/nls/wmes-dummyPaint-codes';
  var baseBreadcrumb = '#dummyPaint/orders';
  var canView = user.auth('DUMMY_PAINT:MANAGE');
  var canManage = canView;

  router.map('/dummyPaint/codes', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/wmes-dummyPaint-codes/DpCodeCollection',
        nls
      ],
      function(ListPage, DpCodeCollection)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          columns: [
            {id: '_id', className: 'is-min'},
            {id: 'name'}
          ],
          collection: new DpCodeCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/dummyPaint/codes/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/wmes-dummyPaint-codes/DpCode',
        'app/wmes-dummyPaint-codes/templates/details',
        nls
      ],
      function(DetailsPage, DpCode, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          detailsTemplate: detailsTemplate,
          model: new DpCode({_id: req.params.id})
        });
      }
    );
  });

  router.map('/dummyPaint/codes;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wmes-dummyPaint-codes/DpCode',
        'app/wmes-dummyPaint-codes/templates/form',
        nls
      ],
      function(AddFormPage, DpCode, formTemplate)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          formTemplate: formTemplate,
          model: new DpCode()
        });
      }
    );
  });

  router.map('/dummyPaint/codes/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wmes-dummyPaint-codes/DpCode',
        'app/wmes-dummyPaint-codes/templates/form',
        nls
      ],
      function(EditFormPage, DpCode, formTemplate)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          formTemplate: formTemplate,
          model: new DpCode({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/dummyPaint/codes/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/wmes-dummyPaint-codes/DpCode', _, _, {
      baseBreadcrumb: baseBreadcrumb
    })
  );
});
