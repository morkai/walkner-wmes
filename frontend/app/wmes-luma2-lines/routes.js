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

  var nls = 'i18n!app/nls/wmes-luma2-lines';
  var model = 'app/wmes-luma2-lines/Line';
  var canView = user.auth('LUMA2:MANAGE');
  var canManage = canView;
  var baseBreadcrumb = '#luma2/events';

  router.map('/luma2/lines', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/wmes-luma2-lines/LineCollection',
        nls
      ],
      function(ListPage, LineCollection)
      {
        return new ListPage({
          baseBreadcrumb: baseBreadcrumb,
          collection: new LineCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            {id: 'active', className: 'is-min'},
            {id: 'host', className: 'is-min'},
            {id: 'port', className: 'is-min'},
            {id: 'unit', className: 'is-min'},
            '-'
          ]
        });
      }
    );
  });

  router.map('/luma2/lines/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        model,
        'app/wmes-luma2-lines/templates/details',
        nls
      ],
      function(DetailsPage, Line, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: baseBreadcrumb,
          model: new Line({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/luma2/lines;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        model,
        'app/wmes-luma2-lines/views/FormView',
        nls
      ],
      function(AddFormPage, Line, FormView)
      {
        return new AddFormPage({
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Line()
        });
      }
    );
  });

  router.map('/luma2/lines/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        model,
        'app/wmes-luma2-lines/views/FormView',
        nls
      ],
      function(EditFormPage, Line, FormView)
      {
        return new EditFormPage({
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Line({_id: req.params.id})
        });
      }
    );
  });

  router.map('/luma2/lines/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: baseBreadcrumb
  }));

  router.map('/luma2/settings', canManage, function(req)
  {
    viewport.loadPage(['app/wmes-luma2-lines/pages/SettingsPage', nls], function(SettingsPage)
    {
      return new SettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
