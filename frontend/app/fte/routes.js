// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './FteMasterEntry',
  './FteLeaderEntry',
  './pages/FteMasterEntryListPage',
  './pages/FteMasterEntryAddFormPage',
  './pages/FteMasterEntryEditFormPage',
  './pages/FteMasterEntryDetailsPage',
  './pages/FteMasterEntryDetailsPrintablePage',
  './pages/FteLeaderEntryListPage',
  './pages/FteLeaderEntryAddFormPage',
  './pages/FteLeaderEntryEditFormPage',
  './pages/FteLeaderEntryDetailsPage',
  './pages/FteLeaderEntryDetailsPrintablePage',
  'i18n!app/nls/fte'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  FteMasterEntry,
  FteLeaderEntry,
  FteMasterEntryListPage,
  FteMasterEntryAddFormPage,
  FteMasterEntryEditFormPage,
  FteMasterEntryDetailsPage,
  FteMasterEntryDetailsPrintablePage,
  FteLeaderEntryListPage,
  FteLeaderEntryAddFormPage,
  FteLeaderEntryEditFormPage,
  FteLeaderEntryDetailsPage,
  FteLeaderEntryDetailsPrintablePage
) {
  'use strict';

  var canViewMaster = user.auth('FTE:MASTER:VIEW');
  var canManageMaster = user.auth('FTE:MASTER:MANAGE', 'PROD_DATA:MANAGE');
  var canViewLeader = user.auth('FTE:LEADER:VIEW');
  var canManageLeader = user.auth('FTE:LEADER:MANAGE', 'PROD_DATA:MANAGE');

  router.map('/fte/master', canViewMaster, function(req)
  {
    viewport.showPage(new FteMasterEntryListPage({rql: req.rql}));
  });

  router.map('/fte/master;add', canManageMaster, function()
  {
    viewport.showPage(new FteMasterEntryAddFormPage());
  });

  router.map('/fte/master/:id', canViewMaster, function(req)
  {
    viewport.showPage(new FteMasterEntryDetailsPage({modelId: req.params.id}));
  });

  router.map('/fte/master/:id;edit', canManageMaster, function(req)
  {
    viewport.showPage(new FteMasterEntryEditFormPage({modelId: req.params.id}));
  });

  router.map('/fte/master/:id;print', canViewMaster, function(req)
  {
    viewport.showPage(new FteMasterEntryDetailsPrintablePage({modelId: req.params.id}));
  });

  router.map(
    '/fte/master/:id;delete', canManageMaster, showDeleteFormPage.bind(null, FteMasterEntry)
  );

  router.map('/fte/leader', canViewLeader, function(req)
  {
    viewport.showPage(new FteLeaderEntryListPage({rql: req.rql}));
  });

  router.map('/fte/leader;add', canManageLeader, function()
  {
    viewport.showPage(new FteLeaderEntryAddFormPage());
  });

  router.map('/fte/leader/:id', canViewLeader, function(req)
  {
    viewport.showPage(new FteLeaderEntryDetailsPage({modelId: req.params.id}));
  });

  router.map('/fte/leader/:id;edit', canManageLeader, function(req)
  {
    viewport.showPage(new FteLeaderEntryEditFormPage({modelId: req.params.id}));
  });

  router.map('/fte/leader/:id;print', canViewLeader, function(req)
  {
    viewport.showPage(new FteLeaderEntryDetailsPrintablePage({modelId: req.params.id}));
  });

  router.map(
    '/fte/leader/:id;delete', canManageLeader, showDeleteFormPage.bind(null, FteLeaderEntry)
  );

  router.map('/fte;settings', user.auth('PROD_DATA:MANAGE'), function(req)
  {
    viewport.loadPage('app/fte/pages/FteSettingsPage', function(FteSettingsPage)
    {
      return new FteSettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
