define([
  '../router',
  '../viewport',
  '../user',
  './pages/EventListPage',
  'i18n!app/nls/events'
], function(
  router,
  viewport,
  user,
  EventListPage
) {
  'use strict';

  router.map('/events', user.auth('EVENTS:VIEW'), function(req)
  {
    viewport.showPage(new EventListPage({rql: req.rql}));
  });
});
