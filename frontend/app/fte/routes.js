define([
  '../router',
  '../viewport',
  '../user',
  './pages/FteMasterEntryListPage',
  './pages/FteMasterCurrentEntryPage',
  './pages/FteMasterEntryFormPage',
  './pages/FteMasterEntryDetailsPage',
  './pages/FteMasterEntryDetailsPrintablePage',
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
  FteMasterEntryListPage,
  FteMasterCurrentEntryPage,
  FteMasterEntryFormPage,
  FteMasterEntryDetailsPage,
  FteMasterEntryDetailsPrintablePage,
  FteLeaderEntryListPage,
  FteLeaderCurrentEntryPage,
  FteLeaderEntryFormPage,
  FteLeaderEntryDetailsPage,
  FteLeaderEntryDetailsPrintablePage
) {
  'use strict';

  var canViewMaster = user.auth('FTE:MASTER:VIEW');
  var canManageMaster = user.auth('FTE:MASTER:MANAGE');
  var canViewLeader = user.auth('FTE:LEADER:VIEW');
  var canManageLeader = user.auth('FTE:LEADER:MANAGE');

  router.map('/fte/master', canViewMaster, function(req)
  {
    viewport.showPage(new FteMasterEntryListPage({rql: req.rql}));
  });

  router.map('/fte/master/:id', canViewMaster, function(req)
  {
    viewport.showPage(new FteMasterEntryDetailsPage({modelId: req.params.id}));
  });

  router.map('/fte/master/:id;edit', canManageMaster, function(req)
  {
    viewport.showPage(new FteMasterEntryFormPage({modelId: req.params.id}));
  });

  router.map('/fte/master/:id;print', canViewMaster, function(req)
  {
    viewport.showPage(new FteMasterEntryDetailsPrintablePage({modelId: req.params.id}));
  });

  router.map('/fte/master/current', canManageMaster, function()
  {
    viewport.showPage(new FteMasterCurrentEntryPage());
  });

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
