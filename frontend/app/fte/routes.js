// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './FteMasterEntry',
  './FteLeaderEntry',
  'i18n!app/nls/fte'
], function(
  broker,
  router,
  viewport,
  user,
  showDeleteFormPage,
  FteMasterEntry,
  FteLeaderEntry
) {
  'use strict';

  var canViewMaster = user.auth('FTE:MASTER:VIEW');
  var canManageMaster = user.auth('FTE:MASTER:MANAGE', 'PROD_DATA:MANAGE');
  var canViewLeader = user.auth('FTE:LEADER:VIEW');
  var canManageLeader = user.auth('FTE:LEADER:MANAGE', 'PROD_DATA:MANAGE');

  router.map('/fte/master', canViewMaster, function(req)
  {
    viewport.loadPage(['app/fte/pages/FteMasterEntryListPage'], function(FteMasterEntryListPage)
    {
      return new FteMasterEntryListPage({rql: req.rql});
    });
  });

  router.map('/fte/master;add', canManageMaster, function()
  {
    viewport.loadPage(['app/fte/pages/FteMasterEntryAddFormPage'], function(FteMasterEntryAddFormPage)
    {
      return new FteMasterEntryAddFormPage();
    });
  });

  router.map('/fte/master/:id', canViewMaster, function(req)
  {
    if (req.query.change)
    {
      broker.publish('router.navigate', {
        url: '/fte/master/' + req.params.id,
        trigger: false,
        replace: true
      });
    }

    viewport.loadPage(['app/fte/pages/FteMasterEntryDetailsPage'], function(FteMasterEntryDetailsPage)
    {
      return new FteMasterEntryDetailsPage({
        modelId: req.params.id,
        change: req.query.change
      });
    });
  });

  router.map('/fte/master/:id;edit', canManageMaster, function(req)
  {
    viewport.loadPage(['app/fte/pages/FteMasterEntryEditFormPage'], function(FteMasterEntryEditFormPage)
    {
      return new FteMasterEntryEditFormPage({modelId: req.params.id});
    });
  });

  router.map('/fte/master/:id;print', canViewMaster, function(req)
  {
    viewport.loadPage(['app/fte/pages/FteMasterEntryDetailsPrintablePage'], function(FteMasterEntryDetailsPrintablePage)
    {
      return new FteMasterEntryDetailsPrintablePage({modelId: req.params.id});
    });
  });

  router.map('/fte/master/:id;delete', canManageMaster, showDeleteFormPage.bind(null, FteMasterEntry));

  router.map('/fte/leader', canViewLeader, function(req)
  {
    viewport.loadPage(['app/fte/pages/FteLeaderEntryListPage'], function(FteLeaderEntryListPage)
    {
      return new FteLeaderEntryListPage({rql: req.rql});
    });
  });

  router.map('/fte/leader;add', canManageLeader, function()
  {
    viewport.loadPage(['app/fte/pages/FteLeaderEntryAddFormPage'], function(FteLeaderEntryAddFormPage)
    {
      return new FteLeaderEntryAddFormPage();
    });
  });

  router.map('/fte/leader/:id', canViewLeader, function(req)
  {
    if (req.query.change)
    {
      broker.publish('router.navigate', {
        url: '/fte/leader/' + req.params.id,
        trigger: false,
        replace: true
      });
    }

    viewport.loadPage(['app/fte/pages/FteLeaderEntryDetailsPage'], function(FteLeaderEntryDetailsPage)
    {
      return new FteLeaderEntryDetailsPage({
        modelId: req.params.id,
        change: req.query.change
      });
    });
  });

  router.map('/fte/leader/:id;edit', canManageLeader, function(req)
  {
    viewport.loadPage(['app/fte/pages/FteLeaderEntryEditFormPage'], function(FteLeaderEntryEditFormPage)
    {
      return new FteLeaderEntryEditFormPage({modelId: req.params.id});
    });
  });

  router.map('/fte/leader/:id;print', canViewLeader, function(req)
  {
    viewport.loadPage(['app/fte/pages/FteLeaderEntryDetailsPrintablePage'], function(FteLeaderEntryDetailsPrintablePage)
    {
      return new FteLeaderEntryDetailsPrintablePage({modelId: req.params.id});
    });
  });

  router.map('/fte/leader/:id;delete', canManageLeader, showDeleteFormPage.bind(null, FteLeaderEntry));

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
