define([
  '../router',
  '../viewport',
  '../user',
  '../data/aors',
  './Aor',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/views/FormView',
  '../core/pages/ActionFormPage',
  'app/aors/templates/details',
  'app/aors/templates/form',
  'i18n!app/nls/aors'
], function(
  router,
  viewport,
  user,
  aors,
  Aor,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  FormView,
  ActionFormPage,
  detailsTemplate,
  formTemplate
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/aors', canView, function()
  {
    viewport.showPage(new ListPage({
      collection: aors,
      columns: ['name', 'description']
    }));
  });

  router.map('/aors/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      model: new Aor({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/aors;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      model: new Aor(),
      formTemplate: formTemplate
    }));
  });

  router.map('/aors/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      model: new Aor({_id: req.params.id}),
      formTemplate: formTemplate
    }));
  });

  router.map('/aors/:id;delete', canManage, function(req, referer)
  {
    var model = new Aor({_id: req.params.id});

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
