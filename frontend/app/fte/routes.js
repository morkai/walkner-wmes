// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  broker,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var css = 'css!app/fte/assets/main';
  var nls = 'i18n!app/nls/fte';
  var canViewMaster = user.auth('FTE:MASTER:VIEW');
  var canManageMaster = user.auth('FTE:MASTER:MANAGE', 'PROD_DATA:MANAGE');
  var canViewLeader = user.auth('FTE:LEADER:VIEW');
  var canManageLeader = user.auth('FTE:LEADER:MANAGE', 'PROD_DATA:MANAGE');
  var canViewWh = user.auth('FTE:WH:VIEW');
  var canManageWh = user.auth('FTE:WH:MANAGE', 'PROD_DATA:MANAGE');

  router.map('/fte;settings', user.auth('PROD_DATA:MANAGE'), function(req)
  {
    viewport.loadPage(['app/fte/pages/FteSettingsPage', css, nls], function(FteSettingsPage)
    {
      return new FteSettingsPage({
        initialTab: req.query.tab
      });
    });
  });

  // Production
  router.map('/fte/master', canViewMaster, function(req)
  {
    viewport.loadPage(
      [
        'app/fte/FteMasterEntryCollection',
        'app/fte/pages/FteMasterEntryListPage',
        css,
        nls
      ],
      function(FteMasterEntryCollection, FteMasterEntryListPage)
      {
        return new FteMasterEntryListPage({
          collection: new FteMasterEntryCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/fte/master;add', canManageMaster, function()
  {
    viewport.loadPage(
      [
        'app/fte/FteMasterEntry',
        'app/fte/pages/FteMasterEntryAddFormPage',
        css,
        nls
      ],
      function(FteMasterEntry, FteMasterEntryAddFormPage)
      {
        return new FteMasterEntryAddFormPage({
          model: new FteMasterEntry()
        });
      }
    );
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

    viewport.loadPage(
      [
        'app/fte/FteMasterEntry',
        'app/fte/pages/FteMasterEntryDetailsPage',
        css,
        nls
      ],
      function(FteMasterEntry, FteMasterEntryDetailsPage)
      {
        return new FteMasterEntryDetailsPage({
          model: new FteMasterEntry({_id: req.params.id}),
          change: req.query.change
        });
      }
    );
  });

  router.map('/fte/master/:id;edit', canManageMaster, function(req)
  {
    viewport.loadPage(
      [
        'app/fte/FteMasterEntry',
        'app/fte/pages/FteMasterEntryEditFormPage',
        css,
        nls
      ],
      function(FteMasterEntry, FteMasterEntryEditFormPage)
      {
        return new FteMasterEntryEditFormPage({
          model: new FteMasterEntry({_id: req.params.id})
        });
      }
    );
  });

  router.map('/fte/master/:id;print', canViewMaster, function(req)
  {
    viewport.loadPage(
      [
        'app/fte/FteMasterEntry',
        'app/fte/pages/FteMasterEntryDetailsPrintablePage',
        css,
        nls
      ],
      function(FteMasterEntry, FteMasterEntryDetailsPrintablePage)
      {
        return new FteMasterEntryDetailsPrintablePage({
          model: new FteMasterEntry({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/fte/master/:id;delete',
    canManageMaster,
    _.partial(showDeleteFormPage, 'app/fte/FteMasterEntry', _, _, {
      browseBreadcrumb: 'BREADCRUMBS:master:browse'
    })
  );

  // Other
  router.map('/fte/leader', canViewLeader, function(req)
  {
    viewport.loadPage(
      [
        'app/fte/FteLeaderEntryCollection',
        'app/fte/pages/FteLeaderEntryListPage',
        css,
        nls
      ],
      function(FteLeaderEntryCollection, FteLeaderEntryListPage)
      {
        return new FteLeaderEntryListPage({
          collection: new FteLeaderEntryCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/fte/leader;add', canManageLeader, function()
  {
    viewport.loadPage(
      [
        'app/fte/FteLeaderEntry',
        'app/fte/pages/FteLeaderEntryAddFormPage',
        css,
        nls
      ],
      function(FteLeaderEntry, FteLeaderEntryAddFormPage)
      {
        return new FteLeaderEntryAddFormPage({
          model: new FteLeaderEntry()
        });
      }
    );
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

    viewport.loadPage(
      [
        'app/fte/FteLeaderEntry',
        'app/fte/pages/FteLeaderEntryDetailsPage',
        css,
        nls
      ],
      function(FteLeaderEntry, FteLeaderEntryDetailsPage)
      {
        return new FteLeaderEntryDetailsPage({
          model: new FteLeaderEntry({_id: req.params.id}),
          change: req.query.change
        });
      }
    );
  });

  router.map('/fte/leader/:id;edit', canManageLeader, function(req)
  {
    viewport.loadPage(
      [
        'app/fte/FteLeaderEntry',
        'app/fte/pages/FteLeaderEntryEditFormPage',
        css,
        nls
      ],
      function(FteLeaderEntry, FteLeaderEntryEditFormPage)
      {
        return new FteLeaderEntryEditFormPage({
          model: new FteLeaderEntry({_id: req.params.id})
        });
      }
    );
  });

  router.map('/fte/leader/:id;print', canViewLeader, function(req)
  {
    viewport.loadPage(
      [
        'app/fte/FteLeaderEntry',
        'app/fte/pages/FteLeaderEntryDetailsPrintablePage',
        css,
        nls
      ],
      function(FteLeaderEntry, FteLeaderEntryDetailsPrintablePage)
      {
        return new FteLeaderEntryDetailsPrintablePage({
          model: new FteLeaderEntry({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/fte/leader/:id;delete',
    canManageLeader,
    _.partial(showDeleteFormPage, 'app/fte/FteLeaderEntry', _, _, {
      browseBreadcrumb: 'BREADCRUMBS:leader:browse'
    })
  );

  // Warehouse
  router.map('/fte/wh', canViewWh, function(req)
  {
    viewport.loadPage(
      [
        'app/fte/FteWhEntryCollection',
        'app/fte/pages/FteLeaderEntryListPage',
        css,
        nls
      ],
      function(FteWhEntryCollection, FteLeaderEntryListPage)
      {
        return new FteLeaderEntryListPage({
          collection: new FteWhEntryCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/fte/wh;add', canManageWh, function()
  {
    viewport.loadPage(
      [
        'app/fte/FteWhEntry',
        'app/fte/pages/FteLeaderEntryAddFormPage',
        css,
        nls
      ],
      function(FteWhEntry, FteLeaderEntryAddFormPage)
      {
        return new FteLeaderEntryAddFormPage({
          model: new FteWhEntry()
        });
      }
    );
  });

  router.map('/fte/wh/:id', canViewWh, function(req)
  {
    if (req.query.change)
    {
      broker.publish('router.navigate', {
        url: '/fte/wh/' + req.params.id,
        trigger: false,
        replace: true
      });
    }

    viewport.loadPage(
      [
        'app/fte/FteWhEntry',
        'app/fte/pages/FteLeaderEntryDetailsPage',
        css,
        nls
      ],
      function(FteWhEntry, FteLeaderEntryDetailsPage)
      {
        return new FteLeaderEntryDetailsPage({
          model: new FteWhEntry({_id: req.params.id}),
          change: req.query.change
        });
      }
    );
  });

  router.map('/fte/wh/:id;edit', canManageWh, function(req)
  {
    viewport.loadPage(
      [
        'app/fte/FteWhEntry',
        'app/fte/pages/FteLeaderEntryEditFormPage',
        css,
        nls
      ],
      function(FteWhEntry, FteLeaderEntryEditFormPage)
      {
        return new FteLeaderEntryEditFormPage({
          model: new FteWhEntry({_id: req.params.id})
        });
      }
    );
  });

  router.map('/fte/wh/:id;print', canViewWh, function(req)
  {
    viewport.loadPage(
      [
        'app/fte/FteWhEntry',
        'app/fte/pages/FteLeaderEntryDetailsPrintablePage',
        css,
        nls
      ],
      function(FteWhEntry, FteLeaderEntryDetailsPrintablePage)
      {
        return new FteLeaderEntryDetailsPrintablePage({
          model: new FteWhEntry({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/fte/wh/:id;delete',
    canManageWh,
    _.partial(showDeleteFormPage, 'app/fte/FteWhEntry', _, _, {
      browseBreadcrumb: 'BREADCRUMBS:wh:browse'
    })
  );
});
