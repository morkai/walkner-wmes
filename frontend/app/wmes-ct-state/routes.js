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

  router.map('/ct', user.auth('PROD_DATA:VIEW'), function()
  {
    viewport.loadPage(
      [
        'app/wmes-ct-state/LineStateCollection',
        'app/wmes-ct-state/pages/ListPage',
        'css!app/wmes-ct-state/assets/main',
        'i18n!app/nls/wmes-ct-state'
      ],
      function(LineStateCollection, ListPage)
      {
        return new ListPage({
          collection: new LineStateCollection()
        });
      }
    );
  });
});
