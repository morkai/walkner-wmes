define([
  'app/router',
  'app/viewport',
  'app/user',
  './pages/EventListPage'
], function(
  router,
  viewport,
  user,
  EventListPage
) {
  'use strict';

  router.map('/events', user.auth('EVENTS:VIEW'), function showEventListPage(req)
  {
    viewport.showPage(new EventListPage({rql: req.rql}));
  });
});
