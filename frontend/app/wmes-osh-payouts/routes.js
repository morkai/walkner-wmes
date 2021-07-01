// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/router',
  'app/viewport',
  'app/user',
  './Payout',
  './PayoutCollection',
  './pages/ListPage',
  './pages/DetailsPage',
  'i18n!app/nls/wmes-osh-rewards',
  'i18n!app/nls/wmes-osh-payouts'
], function(
  router,
  viewport,
  user,
  Payout,
  PayoutCollection,
  ListPage,
  DetailsPage
) {
  'use strict';

  const canView = user.auth('OSH:REWARDS:MANAGE');

  router.map('/osh/payouts', canView, req =>
  {
    viewport.showPage(new ListPage({
      collection: new PayoutCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/osh/payouts/:id', canView, req =>
  {
    viewport.showPage(new DetailsPage({
      model: new Payout({_id: req.params.id})
    }));
  });
});
