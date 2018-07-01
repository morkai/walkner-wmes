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

  var nls = 'i18n!app/nls/kanbanSupplyAreas';
  var canView = user.auth();
  var canManage = user.auth('KANBAN:MANAGE');

  router.map('/kanban/supplyAreas', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/kanbanSupplyAreas/KanbanSupplyAreaCollection',
        'app/kanbanSupplyAreas/pages/KanbanSupplyAreaListPage',
        nls
      ],
      function(KanbanSupplyAreaCollection, KanbanSupplyAreaListPage)
      {
        return new KanbanSupplyAreaListPage({
          collection: new KanbanSupplyAreaCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/kanban/supplyAreas/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kanbanSupplyAreas/KanbanSupplyArea',
        'app/kanbanSupplyAreas/templates/details',
        nls
      ],
      function(DetailsPage, KanbanSupplyArea, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: '#kanban',
          model: new KanbanSupplyArea({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/kanban/supplyAreas;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kanbanSupplyAreas/KanbanSupplyArea',
        'app/kanbanSupplyAreas/views/KanbanSupplyAreaFormView',
        nls
      ],
      function(AddFormPage, KanbanSupplyArea, KanbanSupplyAreaFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: '#kanban',
          FormView: KanbanSupplyAreaFormView,
          model: new KanbanSupplyArea()
        });
      }
    );
  });

  router.map('/kanban/supplyAreas/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kanbanSupplyAreas/KanbanSupplyArea',
        'app/kanbanSupplyAreas/views/KanbanSupplyAreaFormView',
        nls
      ],
      function(EditFormPage, KanbanSupplyArea, KanbanSupplyAreaFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: '#kanban',
          FormView: KanbanSupplyAreaFormView,
          model: new KanbanSupplyArea({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/kanban/supplyAreas/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/kanbanSupplyAreas/KanbanSupplyArea', _, _, {
      baseBreadcrumb: true
    })
  );
});
