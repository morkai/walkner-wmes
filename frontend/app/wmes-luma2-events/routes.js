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

  router.map('/luma2/events', user.auth('LUMA2:VIEW'), function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-luma2-events/EventCollection',
        'app/wmes-luma2-events/pages/ListPage',
        'i18n!app/nls/wmes-luma2-events'
      ],
      function(EventCollection, ListPage)
      {
        return new ListPage({
          collection: new EventCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });
});
