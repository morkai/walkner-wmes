define([
  '../router',
  '../viewport',
  '../user',
  '../data/prodLines',
  './ProdLine',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/ProdLineListView',
  './views/ProdLineDetailsView',
  './views/ProdLineFormView',
  'i18n!app/nls/prodLines'
], function(
  router,
  viewport,
  user,
  prodLines,
  ProdLine,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  ProdLineListView,
  ProdLineDetailsView,
  ProdLineFormView
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/prodLines', canView, function()
  {
    viewport.showPage(new ListPage({
      ListView: ProdLineListView,
      collection: prodLines
    }));
  });

  router.map('/prodLines/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      DetailsView: ProdLineDetailsView,
      model: new ProdLine({_id: req.params.id})
    }));
  });

  router.map('/prodLines;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: ProdLineFormView,
      model: new ProdLine()
    }));
  });

  router.map('/prodLines/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: ProdLineFormView,
      model: new ProdLine({_id: req.params.id})
    }));
  });

  router.map('/prodLines/:id;delete', canManage, function(req, referer)
  {
    var model = new ProdLine({_id: req.params.id});

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
