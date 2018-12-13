// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './DelayReasonCollection',
  './DelayReason'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  DelayReasonCollection,
  DelayReason
) {
  'use strict';

  var nls = 'i18n!app/nls/delayReasons';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/delayReasons', canView, function(req)
  {
    viewport.loadPage(['app/core/pages/ListPage', nls], function(ListPage)
    {
      return new ListPage({
        collection: new DelayReasonCollection(null, {rqlQuery: req.rql}),
        columns: [
          {id: 'name', className: 'is-min'},
          {id: 'active', className: 'is-min'},
          {id: 'drm', tdClassName: 'is-min'},
          '-'
        ]
      });
    });
  });

  router.map('/delayReasons/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/delayReasons/templates/details', nls],
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
      [
        'app/core/pages/AddFormPage',
        'app/delayReasons/views/DelayReasonFormView',
        'i18n!app/nls/users',
        nls
      ],
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
      [
        'app/core/pages/EditFormPage',
        'app/delayReasons/views/DelayReasonFormView',
        'i18n!app/nls/users',
        nls
      ],
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
