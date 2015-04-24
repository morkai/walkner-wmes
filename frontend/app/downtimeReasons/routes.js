// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../data/downtimeReasons',
  './DowntimeReason',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/DowntimeReasonFormView',
  'app/downtimeReasons/templates/details',
  'i18n!app/nls/downtimeReasons'
], function(
  router,
  viewport,
  user,
  downtimeReasons,
  DowntimeReason,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  DowntimeReasonFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/downtimeReasons', canView, function()
  {
    viewport.showPage(new ListPage({
      collection: downtimeReasons,
      columns: [
        '_id',
        'label',
        'type',
        'defaultAor',
        'subdivisionTypes',
        'aors',
        'opticsPosition',
        'pressPosition',
        'auto',
        'scheduled',
        'color',
        'refColor',
        'refValue'
      ]
    }));
  });

  router.map('/downtimeReasons/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      model: new DowntimeReason({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/downtimeReasons;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: DowntimeReasonFormView,
      model: new DowntimeReason()
    }));
  });

  router.map('/downtimeReasons/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: DowntimeReasonFormView,
      model: new DowntimeReason({_id: req.params.id})
    }));
  });

  router.map('/downtimeReasons/:id;delete', canManage, function(req, referer)
  {
    var model = new DowntimeReason({_id: req.params.id});

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
