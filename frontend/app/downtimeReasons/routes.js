// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/downtimeReasons',
  './DowntimeReason'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  downtimeReasons,
  DowntimeReason
) {
  'use strict';

  var nls = 'i18n!app/nls/downtimeReasons';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/downtimeReasons', canView, function()
  {
    viewport.loadPage(['app/core/pages/ListPage', nls], function(ListPage)
    {
      return new ListPage({
        collection: downtimeReasons,
        columns: [
          '_id',
          'label',
          'type',
          'defaultAor',
          'subdivisionTypes',
          'aors',
          'opticsPosition',
          'pressPosition',
          'auto',
          'scheduled',
          'color',
          'refColor',
          'refValue'
        ]
      });
    });
  });

  router.map('/downtimeReasons/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/downtimeReasons/templates/details', nls],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          model: new DowntimeReason({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/downtimeReasons;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/downtimeReasons/views/DowntimeReasonFormView', nls],
      function(AddFormPage, DowntimeReasonFormView)
      {
        return new AddFormPage({
          FormView: DowntimeReasonFormView,
          model: new DowntimeReason()
        });
      }
    );
  });

  router.map('/downtimeReasons/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/downtimeReasons/views/DowntimeReasonFormView', nls],
      function(EditFormPage, DowntimeReasonFormView)
      {
        return new EditFormPage({
          FormView: DowntimeReasonFormView,
          model: new DowntimeReason({_id: req.params.id})
        });
      }
    );
  });

  router.map('/downtimeReasons/:id;delete', canManage, showDeleteFormPage.bind(null, DowntimeReason));

});
