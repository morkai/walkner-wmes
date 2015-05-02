// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './DelayReasonCollection',
  './DelayReason',
  'i18n!app/nls/delayReasons'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  DelayReasonCollection,
  DelayReason
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/delayReasons', canView, function(req)
  {
    viewport.loadPage(['app/core/pages/ListPage'], function(ListPage)
    {
      return new ListPage({
        collection: new DelayReasonCollection(null, {rqlQuery: req.rql}),
        columns: ['name']
      });
    });
  });

  router.map('/delayReasons/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/delayReasons/templates/details'],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          model: new DelayReason({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/delayReasons;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/delayReasons/views/DelayReasonFormView'],
      function(AddFormPage, DelayReasonFormView)
      {
        return new AddFormPage({
          FormView: DelayReasonFormView,
          model: new DelayReason()
        });
      }
    );
  });

  router.map('/delayReasons/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/delayReasons/views/DelayReasonFormView'],
      function(EditFormPage, DelayReasonFormView)
      {
        return new EditFormPage({
          FormView: DelayReasonFormView,
          model: new DelayReason({_id: req.params.id})
        });
      }
    );
  });

  router.map('/delayReasons/:id;delete', canManage, showDeleteFormPage.bind(null, DelayReason));

});
