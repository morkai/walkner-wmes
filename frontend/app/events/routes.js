define([
  '../router',
  '../viewport',
  '../user',
  './pages/EventListPage'
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
