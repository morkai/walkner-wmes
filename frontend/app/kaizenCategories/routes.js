// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './KaizenCategory',
  'i18n!app/nls/kaizenCategories'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  KaizenCategory
) {
  'use strict';

  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenCategories', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/kaizenCategories/KaizenCategoryCollection'
      ],
      function(ListPage, KaizenCategoryCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new KaizenCategoryCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'name',
            {id: 'inNearMiss', className: 'is-min'},
            {id: 'inSuggestion', className: 'is-min'},
            {id: 'position', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/kaizenCategories/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenCategories/KaizenCategory',
        'app/kaizenCategories/templates/details'
      ],
      function(DetailsPage, KaizenCategory, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new KaizenCategory({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/kaizenCategories;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenCategories/KaizenCategory',
        'app/kaizenCategories/views/KaizenCategoryFormView'
      ],
      function(AddFormPage, KaizenCategory, KaizenCategoryFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: KaizenCategoryFormView,
          model: new KaizenCategory()
        });
      }
    );
  });

  router.map('/kaizenCategories/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenCategories/KaizenCategory',
        'app/kaizenCategories/views/KaizenCategoryFormView'
      ],
      function(EditFormPage, KaizenCategory, KaizenCategoryFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: KaizenCategoryFormView,
          model: new KaizenCategory({_id: req.params.id})
        });
      }
    );
  });

  router.map('/kaizenCategories/:id;delete', canManage, _.partial(showDeleteFormPage, KaizenCategory, _, _, {
    baseBreadcrumb: true
  }));

});
