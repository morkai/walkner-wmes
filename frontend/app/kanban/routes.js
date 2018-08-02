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

  router.map('/kanban', canView, function()
  {
    viewport.loadPage(
      ['app/kanban/pages/KanbanEntryListPage', 'i18n!app/nls/kanban', 'i18n!app/nls/kanbanSupplyAreas'],
      function(KanbanEntryListPage)
      {
        return new KanbanEntryListPage();
      }
    );
  });
});
