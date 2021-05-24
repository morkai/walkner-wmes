// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/router',
  'app/viewport',
  'app/user',
  './RewardCollection',
  './pages/ListPage',
  'i18n!app/nls/wmes-osh-rewards'
], function(
  router,
  viewport,
  user,
  RewardCollection,
  ListPage
) {
  'use strict';

  const canView = user.auth('USER');

  router.map('/osh/rewards', canView, function(req)
  {
    viewport.showPage(new ListPage({
      collection: new RewardCollection(null, {rqlQuery: req.rql})
    }));
  });
});
