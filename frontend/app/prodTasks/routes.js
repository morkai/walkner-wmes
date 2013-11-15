define([
  '../router',
  '../viewport',
  '../user',
  './ProdTaskCollection',
  './ProdTask',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/ProdTaskListView',
  './views/ProdTaskDetailsView',
  './views/ProdTaskFormView',
  'i18n!app/nls/prodTasks'
], function(
  router,
  viewport,
  user,
  ProdTaskCollection,
  ProdTask,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  ProdTaskListView,
  ProdTaskDetailsView,
  ProdTaskFormView
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/prodTasks', canView, function(req)
  {
    viewport.showPage(new ListPage({
      ListView: ProdTaskListView,
      collection: new ProdTaskCollection({rqlQuery: req.rql})
    }));
  });

  router.map('/prodTasks/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      DetailsView: ProdTaskDetailsView,
      model: new ProdTask({_id: req.params.id}),
    }));
  });

  router.map('/prodTasks;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: ProdTaskFormView,
      model: new ProdTask()
    }));
  });

  router.map('/prodTasks/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: ProdTaskFormView,
      model: new ProdTask({_id: req.params.id})
    }));
  });

  router.map('/prodTasks/:id;delete', canManage, function(req, referer)
  {
    var model = new ProdTask({_id: req.params.id});

    viewport.showPage(new ActionFormPage({
      model: model,
      actionKey: 'delete',
      successUrl: model.genClientUrl('base'),
      cancelUrl: referer || model.genClientUrl('base'),
      formMethod: 'DELETE',
      formAction: model.url(),
      formActionSeverity: 'danger'
    }));
  });

});
