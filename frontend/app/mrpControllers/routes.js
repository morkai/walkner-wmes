// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../data/mrpControllers',
  './MrpController',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/MrpControllerDetailsView',
  './views/MrpControllerFormView',
  'i18n!app/nls/mrpControllers'
], function(
  router,
  viewport,
  user,
  mrpControllers,
  MrpController,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  MrpControllerDetailsView,
  MrpControllerFormView
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/mrpControllers', canView, function()
  {
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/mrpControllers/views/MrpControllerListView'],
      function(ListPage, MrpControllerListView)
      {
        return new ListPage({
          ListView: MrpControllerListView,
          collection: mrpControllers
        });
      }
    );
  });

  router.map('/mrpControllers/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      DetailsView: MrpControllerDetailsView,
      model: new MrpController({_id: req.params.id})
    }));
  });

  router.map('/mrpControllers;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: MrpControllerFormView,
      model: new MrpController()
    }));
  });

  router.map('/mrpControllers/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: MrpControllerFormView,
      model: new MrpController({_id: req.params.id})
    }));
  });

  router.map('/mrpControllers/:id;delete', canManage, function(req, referer)
  {
    var model = new MrpController({_id: req.params.id});

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
