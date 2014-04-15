// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/workCenters',
  './WorkCenter',
  'i18n!app/nls/workCenters'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  workCenters,
  WorkCenter
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/workCenters', canView, function()
  {
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/workCenters/views/WorkCenterListView'],
      function(ListPage, WorkCenterListView)
      {
        return new ListPage({
          ListView: WorkCenterListView,
          collection: workCenters
        });
      }
    );
  });

  router.map('/workCenters/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/workCenters/views/WorkCenterDetailsView'],
      function(DetailsPage, WorkCenterDetailsView)
      {
        return new DetailsPage({
          DetailsView: WorkCenterDetailsView,
          model: new WorkCenter({_id: req.params.id})
        });
      }
    );
  });

  router.map('/workCenters;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/workCenters/views/WorkCenterFormView'],
      function(AddFormPage, WorkCenterFormView)
      {
        return new AddFormPage({
          FormView: WorkCenterFormView,
          model: new WorkCenter()
        });
      }
    );
  });

  router.map('/workCenters/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/workCenters/views/WorkCenterFormView'],
      function(EditFormPage, WorkCenterFormView)
      {
        return new EditFormPage({
          FormView: WorkCenterFormView,
          model: new WorkCenter({_id: req.params.id})
        });
      }
    );
  });

  router.map('/workCenters/:id;delete', canManage, showDeleteFormPage.bind(null, WorkCenter));

});
