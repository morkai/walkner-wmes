define([
  '../router',
  '../viewport',
  '../user',
  './pages/ProdLogEntryListPage',
  'i18n!app/nls/prodLogEntries'
], function(
  router,
  viewport,
  user,
  ProdLogEntryListPage
) {
  'use strict';

  var canView = user.auth('PROD_DATA:VIEW');

  router.map('/prodLogEntries', canView, function(req)
  {
    viewport.showPage(new ProdLogEntryListPage({rql: req.rql}));
  });
});
