// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './KaizenCategoryCollection',
  './KaizenCategory',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/KaizenCategoryFormView',
  'app/kaizenCategories/templates/details',
  'i18n!app/nls/kaizenCategories'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  KaizenCategoryCollection,
  KaizenCategory,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  KaizenCategoryFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenCategories', canView, function(req)
  {
    viewport.showPage(new ListPage({
      baseBreadcrumb: true,
      collection: new KaizenCategoryCollection(null, {rqlQuery: req.rql}),
      columns: [
        {id: '_id', className: 'is-min'},
        'name',
        {id: 'inNearMiss', className: 'is-min'},
        {id: 'inSuggestion', className: 'is-min'},
        {id: 'position', className: 'is-min'}
      ]
    }));
  });

  router.map('/kaizenCategories/:id', canView, function(req)
  {
    viewport.showPage(new DetailsPage({
      baseBreadcrumb: true,
      model: new KaizenCategory({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/kaizenCategories;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      baseBreadcrumb: true,
      FormView: KaizenCategoryFormView,
      model: new KaizenCategory()
    }));
  });

  router.map('/kaizenCategories/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      baseBreadcrumb: true,
      FormView: KaizenCategoryFormView,
      model: new KaizenCategory({_id: req.params.id})
    }));
  });

  router.map('/kaizenCategories/:id;delete', canManage, _.partial(showDeleteFormPage, KaizenCategory, _, _, {
    baseBreadcrumb: true
  }));

});
