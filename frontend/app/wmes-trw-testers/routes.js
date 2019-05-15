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

  var nls = 'i18n!app/nls/wmes-trw-testers';
  var model = 'app/wmes-trw-testers/Tester';
  var canView = user.auth('TRW:VIEW');
  var canManage = user.auth('TRW:MANAGE');
  var baseBreadcrumb = true;

  router.map('/trw/testers', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wmes-trw-testers/TesterCollection',
        'app/wmes-trw-testers/views/FilterView',
        nls
      ],
      function(FilteredListPage, TesterCollection, FilterView)
      {
        return new FilteredListPage({
          baseBreadcrumb: baseBreadcrumb,
          FilterView: FilterView,
          collection: new TesterCollection(null, {rqlQuery: req.rql}),
          columns: [
            'name'
          ]
        });
      }
    );
  });

  router.map('/trw/testers/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        model,
        'app/wmes-trw-testers/templates/details',
        nls
      ],
      function(DetailsPage, Tester, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: baseBreadcrumb,
          pageClassName: 'page-max-flex',
          model: new Tester({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/trw/testers;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        model,
        'app/wmes-trw-testers/views/FormView',
        nls
      ],
      function(AddFormPage, Tester, FormView)
      {
        return new AddFormPage({
          baseBreadcrumb: baseBreadcrumb,
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new Tester()
        });
      }
    );
  });

  router.map('/trw/testers/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        model,
        'app/wmes-trw-testers/views/FormView',
        nls
      ],
      function(EditFormPage, Tester, FormView)
      {
        return new EditFormPage({
          baseBreadcrumb: baseBreadcrumb,
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new Tester({_id: req.params.id})
        });
      }
    );
  });

  router.map('/trw/testers/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: baseBreadcrumb
  }));
});
