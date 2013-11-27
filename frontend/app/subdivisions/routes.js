define([
  '../router',
  '../viewport',
  '../user',
  '../data/subdivisions',
  './Subdivision',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/SubdivisionDetailsView',
  './views/SubdivisionFormView',
  'i18n!app/nls/subdivisions'
], function(
  router,
  viewport,
  user,
  subdivisions,
  Subdivision,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  SubdivisionDetailsView,
  SubdivisionFormView
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/subdivisions', canView, function()
  {
    viewport.showPage(new ListPage({
      collection: subdivisions,
      columns: ['division', 'name']
    }));
  });

  router.map('/subdivisions/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      DetailsView: SubdivisionDetailsView,
      model: new Subdivision({_id: req.params.id})
    }));
  });

  router.map('/subdivisions;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: SubdivisionFormView,
      model: new Subdivision()
    }));
  });

  router.map('/subdivisions/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: SubdivisionFormView,
      model: new Subdivision({_id: req.params.id})
    }));
  });

  router.map('/subdivisions/:id;delete', canManage, function(req, referer)
  {
    var model = new Subdivision({_id: req.params.id});

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
