define([
  '../router',
  '../viewport',
  '../user',
  './pages/ProdShiftListPage',
  'i18n!app/nls/prodShifts'
], function(
  router,
  viewport,
  user,
  ProdShiftListPage
) {
  'use strict';

  var canView = user.auth('PROD_DATA:VIEW');

  router.map('/prodShifts', canView, function(req)
  {
    viewport.showPage(new ProdShiftListPage({rql: req.rql}));
  });

  router.map('/prodShifts/:id', canView, function(req)
  {
    viewport.loadPage('app/prodShifts/pages/ProdShiftDetailsPage', function(ProdShiftDetailsPage)
    {
      return new ProdShiftDetailsPage({modelId: req.params.id});
    });
  });
});
