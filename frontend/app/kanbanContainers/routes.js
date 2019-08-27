// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var nls = 'i18n!app/nls/kanbanContainers';
  var canView = user.auth();
  var canManage = user.auth('KANBAN:MANAGE');

  router.map('/kanban/containers', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/kanbanContainers/KanbanContainerCollection',
        'app/kanbanContainers/pages/KanbanContainerListPage',
        'css!app/kanbanContainers/assets/main',
        nls
      ],
      function(KanbanContainerCollection, KanbanContainerListPage)
      {
        return new KanbanContainerListPage({
          collection: new KanbanContainerCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/kanban/containers/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kanbanContainers/KanbanContainer',
        'app/kanbanContainers/templates/details',
        nls
      ],
      function(DetailsPage, KanbanContainer, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: '#kanban',
          model: new KanbanContainer({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/kanban/containers;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kanbanContainers/KanbanContainer',
        'app/kanbanContainers/views/KanbanContainerFormView',
        nls
      ],
      function(AddFormPage, KanbanContainer, KanbanContainerFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: '#kanban',
          FormView: KanbanContainerFormView,
          model: new KanbanContainer()
        });
      }
    );
  });

  router.map('/kanban/containers/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kanbanContainers/KanbanContainer',
        'app/kanbanContainers/views/KanbanContainerFormView',
        nls
      ],
      function(EditFormPage, KanbanContainer, KanbanContainerFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: '#kanban',
          FormView: KanbanContainerFormView,
          model: new KanbanContainer({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/kanban/containers/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/kanbanContainers/KanbanContainer', _, _, {
      baseBreadcrumb: true
    })
  );
});
