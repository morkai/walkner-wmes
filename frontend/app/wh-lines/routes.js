// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  var canView = user.auth('WH:VIEW');

  router.map('/wh/lines', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/wh-lines/WhLineCollection',
        'app/wh-lines/views/ListView',
        'i18n!app/nls/wh-lines'
      ],
      function(ListPage, WhLineCollection, ListView)
      {
        return new ListPage({
          baseBreadcrumb: '#wh/pickup/0d',
          pageClassName: 'page-max-flex',
          ListView: ListView,
          collection: new WhLineCollection(null, {rqlQuery: req.rql}),
          actions: []
        });
      }
    );
  });
});
