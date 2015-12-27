// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './LossReasonCollection',
  './LossReason',
  'i18n!app/nls/lossReasons'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  LossReasonCollection,
  LossReason
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/lossReasons', canView, function(req)
  {
    viewport.loadPage(['app/core/pages/ListPage'], function(ListPage)
    {
      return new ListPage({
        collection: new LossReasonCollection(null, {rqlQuery: req.rql}),
        columns: [
          {id: '_id', className: 'is-min'},
          'label',
          {id: 'position', className: 'is-min'}
        ]
      });
    });
  });

  router.map('/lossReasons/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/lossReasons/templates/details'],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          model: new LossReason({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/lossReasons;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/lossReasons/views/LossReasonFormView'],
      function(AddFormPage, LossReasonFormView)
      {
        return new AddFormPage({
          FormView: LossReasonFormView,
          model: new LossReason()
        });
      }
    );
  });

  router.map('/lossReasons/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/lossReasons/views/LossReasonFormView'],
      function(EditFormPage, LossReasonFormView)
      {
        return new EditFormPage({
          FormView: LossReasonFormView,
          model: new LossReason({_id: req.params.id})
        });
      }
    );
  });

  router.map('/lossReasons/:id;delete', canManage, showDeleteFormPage.bind(null, LossReason));

});
