// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './KaizenAreaCollection',
  './KaizenArea',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/KaizenAreaFormView',
  'app/kaizenAreas/templates/details',
  'i18n!app/nls/kaizenAreas'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  KaizenAreaCollection,
  KaizenArea,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  KaizenAreaFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenAreas', canView, function(req)
  {
    viewport.showPage(new ListPage({
      baseBreadcrumb: true,
      collection: new KaizenAreaCollection(null, {rqlQuery: req.rql}),
      columns: [
        {id: '_id', className: 'is-min'},
        'name',
        {id: 'position', className: 'is-min'}
      ]
    }));
  });

  router.map('/kaizenAreas/:id', canView, function(req)
  {
    viewport.showPage(new DetailsPage({
      baseBreadcrumb: true,
      model: new KaizenArea({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/kaizenAreas;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      baseBreadcrumb: true,
      FormView: KaizenAreaFormView,
      model: new KaizenArea()
    }));
  });

  router.map('/kaizenAreas/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      baseBreadcrumb: true,
      FormView: KaizenAreaFormView,
      model: new KaizenArea({_id: req.params.id})
    }));
  });

  router.map('/kaizenAreas/:id;delete', canManage, _.partial(showDeleteFormPage, KaizenArea, _, _, {
    baseBreadcrumb: true
  }));

});
