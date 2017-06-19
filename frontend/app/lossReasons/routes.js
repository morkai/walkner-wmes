// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './LossReason'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  LossReason
) {
  'use strict';

  var nls = 'i18n!app/nls/lossReasons';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/lossReasons', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/lossReasons/LossReasonCollection',
        nls
      ],
      function(ListPage, LossReasonCollection)
      {
        return new ListPage({
          collection: new LossReasonCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'label',
            {id: 'position', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/lossReasons/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/lossReasons/templates/details',
        nls
      ],
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
      [
        'app/core/pages/AddFormPage',
        'app/lossReasons/views/LossReasonFormView',
        nls
      ],
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
      [
        'app/core/pages/EditFormPage',
        'app/lossReasons/views/LossReasonFormView',
        nls
      ],
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
