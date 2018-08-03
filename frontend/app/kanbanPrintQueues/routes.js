// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  var canView = user.auth();

  router.map('/kanban/printQueues', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/kanbanPrintQueues/KanbanPrintQueueCollection',
        'app/kanbanPrintQueues/pages/KanbanPrintQueueListPage',
        'i18n!app/nls/kanbanPrintQueues'
      ],
      function(KanbanPrintQueueCollection, KanbanPrintQueueListPage)
      {
        return new KanbanPrintQueueListPage({
          collection: new KanbanPrintQueueCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });
});
