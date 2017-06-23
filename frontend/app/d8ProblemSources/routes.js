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

  var nls = 'i18n!app/nls/d8ProblemSources';
  var model = 'app/d8ProblemSources/D8ProblemSources';
  var canView = user.auth('D8:DICTIONARIES:VIEW');
  var canManage = user.auth('D8:DICTIONARIES:MANAGE');

  router.map('/d8/problemSources', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/d8ProblemSources/D8ProblemSourceCollection',
        nls
      ],
      function(ListPage, D8ProblemSourceCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new D8ProblemSourceCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'name',
            {id: 'position', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/d8/problemSources/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        model,
        'app/d8ProblemSources/templates/details',
        nls
      ],
      function(DetailsPage, D8ProblemSource, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new D8ProblemSource({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/d8/problemSources;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        model,
        'app/d8ProblemSources/views/D8ProblemSourceFormView',
        nls
      ],
      function(AddFormPage, D8ProblemSource, D8ProblemSourceFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: D8ProblemSourceFormView,
          model: new D8ProblemSource()
        });
      }
    );
  });

  router.map('/d8/problemSources/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        model,
        'app/d8ProblemSources/views/D8ProblemSourceFormView',
        nls
      ],
      function(EditFormPage, D8ProblemSource, D8ProblemSourceFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: D8ProblemSourceFormView,
          model: new D8ProblemSource({_id: req.params.id})
        });
      }
    );
  });

  router.map('/d8/problemSources/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: true
  }));
});
