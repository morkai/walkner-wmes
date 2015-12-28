// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './KaizenProductFamily'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  KaizenProductFamily
) {
  'use strict';

  var nls = 'i18n!app/nls/kaizenProductFamilies';
  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenProductFamilies', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/kaizenProductFamilies/KaizenProductFamilyCollection',
        nls
      ],
      function(ListPage, KaizenProductFamilyCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new KaizenProductFamilyCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            {id: 'name', className: 'is-min'},
            'owners',
            {id: 'position', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/kaizenProductFamilies/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenProductFamilies/KaizenProductFamily',
        'app/kaizenProductFamilies/templates/details',
        nls
      ],
      function(DetailsPage, KaizenProductFamily, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new KaizenProductFamily({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/kaizenProductFamilies;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenProductFamilies/KaizenProductFamily',
        'app/kaizenProductFamilies/views/KaizenProductFamilyFormView',
        nls
      ],
      function(AddFormPage, KaizenProductFamily, KaizenProductFamilyFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: KaizenProductFamilyFormView,
          model: new KaizenProductFamily()
        });
      }
    );
  });

  router.map('/kaizenProductFamilies/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenProductFamilies/KaizenProductFamily',
        'app/kaizenProductFamilies/views/KaizenProductFamilyFormView',
        nls
      ],
      function(EditFormPage, KaizenProductFamily, KaizenProductFamilyFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: KaizenProductFamilyFormView,
          model: new KaizenProductFamily({_id: req.params.id})
        });
      }
    );
  });

  router.map('/kaizenProductFamilies/:id;delete', canManage, _.partial(showDeleteFormPage, KaizenProductFamily, _, _, {
    baseBreadcrumb: true
  }));

});
