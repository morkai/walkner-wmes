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

  router.map('/kanban/printQueues', user.auth(), function(req)
  {
    viewport.loadPage(
      [
        'app/kanbanPrintQueues/KanbanPrintQueueCollection',
        'app/kanbanPrintQueues/pages/KanbanPrintQueueListPage',
        'css!app/kanbanPrintQueues/assets/main',
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
