// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/router',
  'app/viewport',
  'app/user'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  const canView = user.auth('PROD_DATA:VIEW');

  router.map('/ct/balancing/pces', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-ct-balancing/BalancingPceCollection',
        'app/wmes-ct-balancing/pages/ListPage',
        'i18n!app/nls/wmes-ct-balancing',
        'css!app/wmes-ct-balancing/assets/main'
      ],
      function(Collection, ListPage)
      {
        return new ListPage({
          collection: new Collection(null, {rqlQuery: req.rql})
        });
      }
    );
  });
});
