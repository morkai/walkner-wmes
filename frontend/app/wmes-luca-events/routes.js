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

  router.map('/luca/events', user.auth('LUCA:VIEW'), function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-luca-events/dictionaries',
        'app/wmes-luca-events/EventCollection',
        'app/wmes-luca-events/pages/ListPage',
        'i18n!app/nls/wmes-luca-events'
      ],
      function(dictionaries, EventCollection, ListPage)
      {
        return dictionaries.bind(new ListPage({
          collection: new EventCollection(null, {rqlQuery: req.rql})
        }));
      }
    );
  });
});
