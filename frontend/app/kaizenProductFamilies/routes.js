// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './KaizenProductFamilyCollection',
  './KaizenProductFamily',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/KaizenProductFamilyFormView',
  'app/kaizenProductFamilies/templates/details',
  'i18n!app/nls/kaizenProductFamilies'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  KaizenProductFamilyCollection,
  KaizenProductFamily,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  KaizenProductFamilyFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenProductFamilies', canView, function(req)
  {
    viewport.showPage(new ListPage({
      baseBreadcrumb: true,
      collection: new KaizenProductFamilyCollection(null, {rqlQuery: req.rql}),
      columns: [
        {id: '_id', className: 'is-min'},
        {id: 'name', className: 'is-min'},
        'owners',
        {id: 'position', className: 'is-min'}
      ]
    }));
  });

  router.map('/kaizenProductFamilies/:id', canView, function(req)
  {
    viewport.showPage(new DetailsPage({
      baseBreadcrumb: true,
      model: new KaizenProductFamily({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/kaizenProductFamilies;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      baseBreadcrumb: true,
      FormView: KaizenProductFamilyFormView,
      model: new KaizenProductFamily()
    }));
  });

  router.map('/kaizenProductFamilies/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      baseBreadcrumb: true,
      FormView: KaizenProductFamilyFormView,
      model: new KaizenProductFamily({_id: req.params.id})
    }));
  });

  router.map('/kaizenProductFamilies/:id;delete', canManage, _.partial(showDeleteFormPage, KaizenProductFamily, _, _, {
    baseBreadcrumb: true
  }));

});
