define([
  '../router',
  '../viewport',
  '../user',
  '../data/subdivisions',
  './Subdivision',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/ActionFormPage',
  './pages/AddSubdivisionFormPage',
  './pages/EditSubdivisionFormPage',
  './views/SubdivisionListView',
  './views/SubdivisionDetailsView',
  'i18n!app/nls/subdivisions'
], function(
  router,
  viewport,
  user,
  subdivisions,
  Subdivision,
  ListPage,
  DetailsPage,
  ActionFormPage,
  AddSubdivisionFormPage,
  EditSubdivisionFormPage,
  SubdivisionListView,
  SubdivisionDetailsView
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/subdivisions', canView, function()
  {
    viewport.showPage(new ListPage({
      ListView: SubdivisionListView,
      collection: subdivisions
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
    viewport.showPage(new AddSubdivisionFormPage({model: new Subdivision()}));
  });

  router.map('/subdivisions/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditSubdivisionFormPage({model: new Subdivision({_id: req.params.id})}));
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
