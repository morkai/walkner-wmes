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

  var nls = 'i18n!app/nls/wmes-ct-lines';
  var model = 'app/wmes-ct-lines/Line';
  var canView = user.auth('PROD_DATA:MANAGE');
  var canManage = canView;
  var baseBreadcrumb = '#ct';

  router.map('/ct/lines', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/wmes-ct-lines/LineCollection',
        nls
      ],
      function(ListPage, LineCollection)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          collection: new LineCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            {id: 'active', className: 'is-min'},
            {id: 'type', className: 'is-min'},
            {id: 'stationCount', className: 'is-min'},
            '-'
          ]
        });
      }
    );
  });

  router.map('/ct/lines/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        model,
        'app/wmes-ct-lines/views/DetailsView',
        nls
      ],
      function(DetailsPage, Line, DetailsView)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          model: new Line({_id: req.params.id}),
          DetailsView: DetailsView
        });
      }
    );
  });

  router.map('/ct/lines;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        model,
        'app/wmes-ct-lines/views/FormView',
        nls
      ],
      function(AddFormPage, Line, FormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Line()
        });
      }
    );
  });

  router.map('/ct/lines/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        model,
        'app/wmes-ct-lines/views/FormView',
        nls
      ],
      function(EditFormPage, Line, FormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Line({_id: req.params.id})
        });
      }
    );
  });

  router.map('/ct/lines/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: baseBreadcrumb
  }));
});
