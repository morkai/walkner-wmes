// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

  var nls = 'i18n!app/nls/d8EntrySources';
  var model = 'app/d8EntrySources/D8EntrySource';
  var canView = user.auth('D8:DICTIONARIES:VIEW');
  var canManage = user.auth('D8:DICTIONARIES:MANAGE');

  router.map('/d8/entrySources', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/d8EntrySources/D8EntrySourceCollection',
        nls
      ],
      function(ListPage, D8EntrySourceCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new D8EntrySourceCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'name',
            {id: 'position', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/d8/entrySources/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        model,
        'app/d8EntrySources/templates/details',
        nls
      ],
      function(DetailsPage, D8EntrySource, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new D8EntrySource({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/d8/entrySources;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        model,
        'app/d8EntrySources/views/D8EntrySourceFormView',
        nls
      ],
      function(AddFormPage, D8EntrySource, D8EntrySourceFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: D8EntrySourceFormView,
          model: new D8EntrySource()
        });
      }
    );
  });

  router.map('/d8/entrySources/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        model,
        'app/d8EntrySources/views/D8EntrySourceFormView',
        nls
      ],
      function(EditFormPage, D8EntrySource, D8EntrySourceFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: D8EntrySourceFormView,
          model: new D8EntrySource({_id: req.params.id})
        });
      }
    );
  });

  router.map('/d8/entrySources/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: true
  }));

});
