define([
  '../router',
  '../viewport',
  '../user',
  '../data/divisions',
  './Division',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/DivisionFormView',
  'app/divisions/templates/details',
  'i18n!app/nls/divisions'
], function(
  router,
  viewport,
  user,
  divisions,
  Division,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  DivisionFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/divisions', canView, function(req)
  {
    viewport.showPage(new ListPage({
      collection: divisions,
      columns: ['_id', 'description']
    }));
  });

  router.map('/divisions/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      model: new Division({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/divisions;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: DivisionFormView,
      model: new Division()
    }));
  });

  router.map('/divisions/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: DivisionFormView,
      model: new Division({_id: req.params.id})
    }));
  });

  router.map('/divisions/:id;delete', canManage, function(req, referer)
  {
    var model = new Division({_id: req.params.id});

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
