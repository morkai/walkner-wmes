// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../user',
  '../router',
  '../viewport'
], function(
  broker,
  user,
  router,
  viewport
) {
  'use strict';

  var nls = 'i18n!app/nls/kanban';
  var canView = user.auth();
  var canManage = user.auth('KANBAN:MANAGE');

  router.map('/kanban', canView, function(req)
  {
    var nc12 = req.query.nc12;

    if (nc12)
    {
      broker.publish('router.navigate', {
        url: '/kanban',
        trigger: false,
        replace: true
      });

      nc12 = nc12.toString();
    }

    viewport.loadPage(
      [
        'app/kanban/pages/KanbanEntryListPage',
        'css!app/kanban/assets/main',
        nls,
        'i18n!app/nls/kanbanComponents',
        'i18n!app/nls/kanbanContainers'
      ],
      function(KanbanEntryListPage)
      {
        return new KanbanEntryListPage({
          selectComponent: nc12
        });
      }
    );
  });

  router.map('/kanban;settings', canManage, function(req)
  {
    viewport.loadPage(['app/kanban/pages/KanbanSettingsPage', nls], function(KanbanSettingsPage)
    {
      return new KanbanSettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
