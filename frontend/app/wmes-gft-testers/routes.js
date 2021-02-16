// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../router',
  '../viewport',
  '../user',
  '../core/pages/DetailsPage',
  '../core/util/showDeleteFormPage'
], function(
  _,
  t,
  router,
  viewport,
  user,
  DetailsPage,
  showDeleteFormPage
) {
  'use strict';

  var nls = 'i18n!app/nls/wmes-gft-testers';
  var canView = user.auth('GFT:VIEW');
  var canManage = user.auth('GFT:MANAGE');

  router.map('/gft/testers', canView, function(req)
  {
    viewport.loadPage([
      'app/core/pages/ListPage',
      'app/wmes-gft-testers/GftTesterCollection',
      nls
    ], function(ListPage, GftTesterCollection)
    {
      return new ListPage({
        pageClassName: 'page-max-flex',
        baseBreadcrumb: true,
        collection: new GftTesterCollection(null, {
          rqlQuery: req.rql
        }),
        columns: [
          {id: 'name', min: 1},
          {id: 'line', min: 1},
          {id: 'host', min: 1, tdClassName: 'text-fixed'},
          {id: 'active', min: 1},
          '-'
        ]
      });
    });
  });

  router.map('/gft/testers/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-gft-testers/GftTester',
        'app/wmes-gft-testers/templates/details',
        nls
      ],
      function(GftTester, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          detailsTemplate: detailsTemplate,
          model: new GftTester({_id: req.params.id}),
          baseBreadcrumb: true
        });
      }
    );
  });

  router.map('/gft/testers;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wmes-gft-testers/GftTester',
        'app/wmes-gft-testers/views/FormView',
        nls,
        'css!app/wmes-gft-testers/assets/form'
      ],
      function(AddFormPage, GftTester, FormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          FormView,
          model: new GftTester(),
          baseBreadcrumb: true
        });
      }
    );
  });

  router.map('/gft/testers/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wmes-gft-testers/GftTester',
        'app/wmes-gft-testers/views/FormView',
        nls,
        'css!app/wmes-gft-testers/assets/form'
      ],
      function(EditFormPage, GftTester, FormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          FormView,
          model: new GftTester({_id: req.params.id}),
          baseBreadcrumb: true
        });
      }
    );
  });

  router.map(
    '/gft/testers/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/wmes-gft-testers/GftTester', _, _, {
      baseBreadcrumb: true
    })
  );
});
