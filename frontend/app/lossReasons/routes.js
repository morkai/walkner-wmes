// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  './LossReasonCollection',
  './LossReason',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/LossReasonFormView',
  'app/lossReasons/templates/details',
  'i18n!app/nls/lossReasons'
], function(
  router,
  viewport,
  user,
  LossReasonCollection,
  LossReason,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  LossReasonFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/lossReasons', canView, function(req)
  {
    viewport.showPage(new ListPage({
      collection: new LossReasonCollection(null, {rqlQuery: req.rql}),
      columns: ['_id', 'label', 'position']
    }));
  });

  router.map('/lossReasons/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      model: new LossReason({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/lossReasons;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: LossReasonFormView,
      model: new LossReason()
    }));
  });

  router.map('/lossReasons/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: LossReasonFormView,
      model: new LossReason({_id: req.params.id})
    }));
  });

  router.map('/lossReasons/:id;delete', canManage, function(req, referer)
  {
    var model = new LossReason({_id: req.params.id});

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
