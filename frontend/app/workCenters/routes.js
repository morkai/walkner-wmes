// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/workCenters',
  './WorkCenter'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  workCenters,
  WorkCenter
) {
  'use strict';

  var nls = 'i18n!app/nls/workCenters';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/workCenters', canView, function()
  {
    viewport.loadPage(
      ['app/workCenters/pages/WorkCenterListPage', nls],
      function(WorkCenterListPage)
      {
        return new WorkCenterListPage({
          collection: workCenters
        });
      }
    );
  });

  router.map('/workCenters/:id', function(req)
  {
    viewport.loadPage(
      ['app/workCenters/pages/WorkCenterDetailsPage', nls],
      function(WorkCenterDetailsPage)
      {
        return new WorkCenterDetailsPage({
          model: new WorkCenter({_id: req.params.id})
        });
      }
    );
  });

  router.map('/workCenters;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/workCenters/views/WorkCenterFormView', nls],
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
      ['app/core/pages/EditFormPage', 'app/workCenters/views/WorkCenterFormView', nls],
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
