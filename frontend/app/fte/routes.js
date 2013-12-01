define([
  '../router',
  '../viewport',
  '../user',
  './pages/FteLeaderEntryListPage',
  './pages/FteLeaderCurrentEntryPage',
  './pages/FteLeaderEntryFormPage',
  './pages/FteLeaderEntryDetailsPage',
  './pages/FteLeaderEntryDetailsPrintablePage',
  'i18n!app/nls/fte'
], function(
  router,
  viewport,
  user,
  FteLeaderEntryListPage,
  FteLeaderCurrentEntryPage,
  FteLeaderEntryFormPage,
  FteLeaderEntryDetailsPage,
  FteLeaderEntryDetailsPrintablePage
) {
  'use strict';

  var canViewLeader = user.auth('FTE:LEADER:VIEW');
  var canManageLeader = user.auth('FTE:LEADER:MANAGE');

  router.map('/fte/leader', canViewLeader, function(req)
  {
    viewport.showPage(new FteLeaderEntryListPage({rql: req.rql}));
  });

  router.map('/fte/leader/:id', canViewLeader, function(req)
  {
    viewport.showPage(new FteLeaderEntryDetailsPage({modelId: req.params.id}));
  });

  router.map('/fte/leader/:id;edit', canManageLeader, function(req)
  {
    viewport.showPage(new FteLeaderEntryFormPage({modelId: req.params.id}));
  });

  router.map('/fte/leader/:id;print', canViewLeader, function(req)
  {
    viewport.showPage(new FteLeaderEntryDetailsPrintablePage({modelId: req.params.id}));
  });

  router.map('/fte/leader/current', canManageLeader, function()
  {
    viewport.showPage(new FteLeaderCurrentEntryPage());
  });
});
