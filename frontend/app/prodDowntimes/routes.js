define([
  '../router',
  '../viewport',
  '../user',
  './pages/ProdDowntimeListPage',
  './pages/ProdDowntimeDetailsPage',
  './pages/CorroborateProdDowntimePage',
  'i18n!app/nls/prodDowntimes'
], function(
  router,
  viewport,
  user,
  ProdDowntimeListPage,
  ProdDowntimeDetailsPage,
  CorroborateProdDowntimePage
) {
  'use strict';

  var canView = user.auth('PROD_DOWNTIMES:VIEW');
  var canManage = user.auth('PROD_DOWNTIMES:MANAGE');

  router.map('/prodDowntimes', canView, function(req)
  {
    viewport.showPage(new ProdDowntimeListPage({rql: req.rql}));
  });

  router.map('/prodDowntimes/:id', function(req)
  {
    viewport.showPage(new ProdDowntimeDetailsPage({
      modelId: req.params.id
    }));
  });

  router.map('/prodDowntimes/:id;corroborate', canManage, function(req, referer)
  {
    viewport.showPage(new CorroborateProdDowntimePage({
      cancelUrl: referer,
      modelId: req.params.id
    }));
  });
});
