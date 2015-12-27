// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './KaizenCause',
  'i18n!app/nls/kaizenCauses'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  KaizenCause
) {
  'use strict';

  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenCauses', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/kaizenCauses/KaizenCauseCollection'
      ],
      function(ListPage, KaizenCauseCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new KaizenCauseCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'name',
            {id: 'position', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/kaizenCauses/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenCauses/KaizenCause',
        'app/kaizenCauses/templates/details'
      ],
      function(DetailsPage, KaizenCause, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new KaizenCause({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/kaizenCauses;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenCauses/KaizenCause',
        'app/kaizenCauses/views/KaizenCauseFormView'
      ],
      function(AddFormPage, KaizenCause, KaizenCauseFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: KaizenCauseFormView,
          model: new KaizenCause()
        });
      }
    );
  });

  router.map('/kaizenCauses/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenCauses/KaizenCause',
        'app/kaizenCauses/views/KaizenCauseFormView'
      ],
      function(EditFormPage, KaizenCause, KaizenCauseFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: KaizenCauseFormView,
          model: new KaizenCause({_id: req.params.id})
        });
      }
    );
  });

  router.map('/kaizenCauses/:id;delete', canManage, _.partial(showDeleteFormPage, KaizenCause, _, _, {
    baseBreadcrumb: true
  }));

});
