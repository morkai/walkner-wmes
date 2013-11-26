define([
  '../router',
  '../viewport',
  '../user',
  './ProdCenterCollection',
  './ProdCenter',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/ProdCenterFormView',
  'app/prodCenters/templates/details',
  'i18n!app/nls/prodCenters'
], function(
  router,
  viewport,
  user,
  ProdCenterCollection,
  ProdCenter,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  ProdCenterFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/prodCenters', canView, function(req)
  {
    viewport.showPage(new ListPage({
      collection: new ProdCenterCollection({rqlQuery: req.rql}),
      columns: ['_id', 'description']
    }));
  });

  router.map('/prodCenters/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      model: new ProdCenter({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/prodCenters;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: ProdCenterFormView,
      model: new ProdCenter()
    }));
  });

  router.map('/prodCenters/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: ProdCenterFormView,
      model: new ProdCenter({_id: req.params.id})
    }));
  });

  router.map('/prodCenters/:id;delete', canManage, function(req, referer)
  {
    var model = new ProdCenter({_id: req.params.id});

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
