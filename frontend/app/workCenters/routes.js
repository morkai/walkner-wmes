define([
  '../router',
  '../viewport',
  '../user',
  '../data/workCenters',
  './WorkCenter',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/WorkCenterFormView',
  'app/workCenters/templates/details',
  'i18n!app/nls/workCenters'
], function(
  router,
  viewport,
  user,
  workCenters,
  WorkCenter,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  WorkCenterFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/workCenters', canView, function()
  {
    viewport.showPage(new ListPage({
      collection: workCenters,
      columns: ['_id', 'description']
    }));
  });

  router.map('/workCenters/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      model: new WorkCenter({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/workCenters;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: WorkCenterFormView,
      model: new WorkCenter()
    }));
  });

  router.map('/workCenters/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: WorkCenterFormView,
      model: new WorkCenter({_id: req.params.id})
    }));
  });

  router.map('/workCenters/:id;delete', canManage, function(req, referer)
  {
    var model = new WorkCenter({_id: req.params.id});

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
