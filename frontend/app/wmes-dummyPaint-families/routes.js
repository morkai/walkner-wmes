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

  var nls = 'i18n!app/nls/wmes-dummyPaint-families';
  var baseBreadcrumb = '#dummyPaint/orders';
  var canView = user.auth('DUMMY_PAINT:MANAGE');
  var canManage = canView;

  router.map('/dummyPaint/families', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wmes-dummyPaint-families/DpFamilyCollection',
        'app/wmes-dummyPaint-families/views/FilterView',
        nls
      ],
      function(FilteredListPage, DpFamilyCollection, FilterView)
      {
        return new FilteredListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          columns: [
            {id: '_id', className: 'is-min'},
            {id: 'paintFamily'}
          ],
          collection: new DpFamilyCollection(null, {rqlQuery: req.rql}),
          FilterView: FilterView
        });
      }
    );
  });

  router.map('/dummyPaint/families/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/wmes-dummyPaint-families/DpFamily',
        'app/wmes-dummyPaint-families/templates/details',
        nls
      ],
      function(DetailsPage, DpFamily, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          detailsTemplate: detailsTemplate,
          model: new DpFamily({_id: req.params.id})
        });
      }
    );
  });

  router.map('/dummyPaint/families;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wmes-dummyPaint-families/DpFamily',
        'app/wmes-dummyPaint-families/views/FormView',
        nls
      ],
      function(AddFormPage, DpFamily, FormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new DpFamily()
        });
      }
    );
  });

  router.map('/dummyPaint/families/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wmes-dummyPaint-families/DpFamily',
        'app/wmes-dummyPaint-families/views/FormView',
        nls
      ],
      function(EditFormPage, DpFamily, FormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new DpFamily({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/dummyPaint/families/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/wmes-dummyPaint-families/DpFamily', _, _, {
      baseBreadcrumb: baseBreadcrumb
    })
  );
});
