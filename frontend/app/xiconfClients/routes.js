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

  var canView = user.auth('XICONF:VIEW');

  router.map('/xiconf/clients', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/xiconfClients/XiconfClientCollection',
        'app/xiconfClients/pages/XiconfClientListPage',
        'css!app/xiconfClients/assets/main',
        'css!app/licenses/assets/main',
        'i18n!app/nls/xiconfClients',
        'i18n!app/nls/licenses'
      ],
      function(XiconfClientCollection, XiconfClientListPage)
      {
        return new XiconfClientListPage({
          collection: new XiconfClientCollection(null, {
            rqlQuery: req.rql
          })
        });
      }
    );
  });
});
