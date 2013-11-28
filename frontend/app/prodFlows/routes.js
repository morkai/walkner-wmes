define([
  '../router',
  '../viewport',
  '../user',
  '../data/prodFlows',
  './ProdFlow',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/ProdFlowListView',
  './views/ProdFlowDetailsView',
  './views/ProdFlowFormView',
  'i18n!app/nls/prodFlows'
], function(
  router,
  viewport,
  user,
  prodFlows,
  ProdFlow,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  ProdFlowListView,
  ProdFlowDetailsView,
  ProdFlowFormView
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/prodFlows', canView, function()
  {
    viewport.showPage(new ListPage({
      ListView: ProdFlowListView,
      collection: prodFlows
    }));
  });

  router.map('/prodFlows/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      DetailsView: ProdFlowDetailsView,
      model: new ProdFlow({_id: req.params.id})
    }));
  });

  router.map('/prodFlows;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: ProdFlowFormView,
      model: new ProdFlow()
    }));
  });

  router.map('/prodFlows/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: ProdFlowFormView,
      model: new ProdFlow({_id: req.params.id})
    }));
  });

  router.map('/prodFlows/:id;delete', canManage, function(req, referer)
  {
    var model = new ProdFlow({_id: req.params.id});

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
