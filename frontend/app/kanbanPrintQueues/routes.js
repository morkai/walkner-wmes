// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user'
], function(
  _,
  router,
  viewport,
  user
) {
  'use strict';

  var nls = 'i18n!app/nls/kanbanPrintQueues';
  var canView = user.auth();

  router.map('/kanban/printQueues', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/kanbanPrintQueues/KanbanPrintQueueCollection',
        'app/kanbanPrintQueues/pages/KanbanPrintQueueListPage',
        nls
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
