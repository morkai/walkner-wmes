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

  var nls = 'i18n!app/nls/kanbanComponents';
  var canView = user.auth();

  router.map('/kanban/components', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/kanbanComponents/KanbanComponentCollection',
        'app/kanbanComponents/pages/KanbanComponentListPage',
        nls
      ],
      function(KanbanComponentCollection, KanbanComponentListPage)
      {
        return new KanbanComponentListPage({
          collection: new KanbanComponentCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/kanban/components/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kanbanComponents/KanbanComponent',
        'app/kanbanComponents/templates/details',
        nls
      ],
      function(DetailsPage, KanbanComponent, detailsTemplate)
      {
        return new DetailsPage({
          actions: [],
          baseBreadcrumb: '#kanban',
          model: new KanbanComponent({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });
});
