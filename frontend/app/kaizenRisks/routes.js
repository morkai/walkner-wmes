// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './KaizenRiskCollection',
  './KaizenRisk',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/KaizenRiskFormView',
  'app/kaizenRisks/templates/details',
  'i18n!app/nls/kaizenRisks'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  KaizenRiskCollection,
  KaizenRisk,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  KaizenRiskFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenRisks', canView, function(req)
  {
    viewport.showPage(new ListPage({
      baseBreadcrumb: true,
      collection: new KaizenRiskCollection(null, {rqlQuery: req.rql}),
      columns: [
        {id: '_id', className: 'is-min'},
        'name',
        {id: 'position', className: 'is-min'}
      ]
    }));
  });

  router.map('/kaizenRisks/:id', canView, function(req)
  {
    viewport.showPage(new DetailsPage({
      baseBreadcrumb: true,
      model: new KaizenRisk({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/kaizenRisks;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      baseBreadcrumb: true,
      FormView: KaizenRiskFormView,
      model: new KaizenRisk()
    }));
  });

  router.map('/kaizenRisks/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      baseBreadcrumb: true,
      FormView: KaizenRiskFormView,
      model: new KaizenRisk({_id: req.params.id})
    }));
  });

  router.map('/kaizenRisks/:id;delete', canManage, _.partial(showDeleteFormPage, KaizenRisk, _, _, {
    baseBreadcrumb: true
  }));

});
