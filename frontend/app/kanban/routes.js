// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../user',
  '../router',
  '../viewport'
], function(
  user,
  router,
  viewport
) {
  'use strict';

  var canView = user.auth();
  var canManage = user.auth('KANBAN:MANAGE');
  var nls = 'i18n!app/nls/kanban';

  router.map('/kanban', canView, function()
  {
    viewport.loadPage(
      [
        'app/kanban/pages/KanbanEntryListPage',
        nls,
        'i18n!app/nls/kanbanComponents',
        'i18n!app/nls/kanbanContainers'
      ],
      function(KanbanEntryListPage)
      {
        return new KanbanEntryListPage();
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
