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

  var nls = 'i18n!app/nls/wmes-dummyPaint-paints';
  var baseBreadcrumb = '#dummyPaint/orders';
  var canView = user.auth('DUMMY_PAINT:MANAGE');
  var canManage = canView;

  router.map('/dummyPaint/paints', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wmes-dummyPaint-orders/dictionaries',
        'app/wmes-dummyPaint-paints/DpPaintCollection',
        'app/wmes-dummyPaint-paints/views/FilterView',
        nls
      ],
      function(FilteredListPage, dictionaries, DpPaintCollection, FilterView)
      {
        return dictionaries.bind(new FilteredListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          columns: [
            {id: 'code', className: 'is-min'},
            {id: 'family', className: 'is-min'},
            {id: 'nc12', className: 'is-min'},
            {id: 'name'}
          ],
          collection: new DpPaintCollection(null, {rqlQuery: req.rql}),
          FilterView: FilterView
        }));
      }
    );
  });

  router.map('/dummyPaint/paints/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/wmes-dummyPaint-paints/DpPaint',
        'app/wmes-dummyPaint-paints/templates/details',
        nls
      ],
      function(DetailsPage, DpPaint, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          detailsTemplate: detailsTemplate,
          model: new DpPaint({_id: req.params.id})
        });
      }
    );
  });

  router.map('/dummyPaint/paints;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wmes-dummyPaint-orders/dictionaries',
        'app/wmes-dummyPaint-paints/DpPaint',
        'app/wmes-dummyPaint-paints/views/FormView',
        nls
      ],
      function(AddFormPage, dictionaries, DpPaint, FormView)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new DpPaint()
        }));
      }
    );
  });

  router.map('/dummyPaint/paints/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wmes-dummyPaint-orders/dictionaries',
        'app/wmes-dummyPaint-paints/DpPaint',
        'app/wmes-dummyPaint-paints/views/FormView',
        nls
      ],
      function(EditFormPage, dictionaries, DpPaint, FormView)
      {
        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new DpPaint({_id: req.params.id})
        }));
      }
    );
  });

  router.map(
    '/dummyPaint/paints/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/wmes-dummyPaint-paints/DpPaint', _, _, {
      baseBreadcrumb: baseBreadcrumb
    })
  );
});
