// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport'
], function(
  router,
  viewport
) {
  'use strict';

  router.map('/changelog', function()
  {
    viewport.loadPage(
      [
        'app/changelog/pages/ListPage',
        'i18n!app/nls/changelog'
      ],
      function(ListPage)
      {
        return new ListPage();
      }
    );
  });
});
