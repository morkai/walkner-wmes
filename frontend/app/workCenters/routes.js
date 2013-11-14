define([
  'app/router',
  'app/viewport',
  'app/user',
  'app/data/workCenters',
  './pages/WorkCenterListPage',
  './pages/WorkCenterDetailsPage',
  './pages/AddWorkCenterFormPage',
  './pages/EditWorkCenterFormPage',
  './pages/WorkCenterActionFormPage',
  'i18n!app/nls/workCenters'
], function(
  router,
  viewport,
  user,
  workCenters,
  WorkCenterListPage,
  WorkCenterDetailsPage,
  AddWorkCenterFormPage,
  EditWorkCenterFormPage,
  WorkCenterActionFormPage
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/workCenters', canView, function showWorkCenterListPage(req)
  {
    viewport.showPage(new WorkCenterListPage({rql: req.rql, workCenters: workCenters}));
  });

  router.map('/workCenters/:id', function showWorkCenterDetailsPage(req)
  {
    viewport.showPage(new WorkCenterDetailsPage({workCenterId: req.params.id}));
  });

  router.map('/workCenters;add', canManage, function showAddWorkCenterFormPage()
  {
    viewport.showPage(new AddWorkCenterFormPage());
  });

  router.map('/workCenters/:id;edit', canManage, function showEditWorkCenterFormPage(req)
  {
    viewport.showPage(new EditWorkCenterFormPage({workCenterId: req.params.id}));
  });

  router.map(
    '/workCenters/:id;delete', canManage, function showDeleteWorkCenterFormPage(req, referer)
    {
      viewport.showPage(new WorkCenterActionFormPage({
        workCenterId: req.params.id,
        actionKey: 'delete',
        successUrl: '#workCenters',
        cancelUrl: '#' + (referer || '/workCenters').substr(1),
        formMethod: 'DELETE',
        formAction: '/workCenters/' + req.params.id,
        formActionSeverity: 'danger'
      }));
    }
  );

});
