define([
  'app/router',
  'app/viewport',
  'app/user',
  'app/data/downtimeReasons',
  './pages/DowntimeReasonListPage',
  './pages/DowntimeReasonDetailsPage',
  './pages/AddDowntimeReasonFormPage',
  './pages/EditDowntimeReasonFormPage',
  './pages/DowntimeReasonActionFormPage',
  'i18n!app/nls/downtimeReasons'
], function(
  router,
  viewport,
  user,
  downtimeReasons,
  DowntimeReasonListPage,
  DowntimeReasonDetailsPage,
  AddDowntimeReasonFormPage,
  EditDowntimeReasonFormPage,
  DowntimeReasonActionFormPage
) {
  'use strict';

  var canView = user.auth('ORDER_STATUSES:VIEW');
  var canManage = user.auth('ORDER_STATUSES:MANAGE');

  router.map('/downtimeReasons', canView, function showDowntimeReasonListPage(req)
  {
    viewport.showPage(new DowntimeReasonListPage({rql: req.rql, downtimeReasons: downtimeReasons}));
  });

  router.map('/downtimeReasons/:id', function showDowntimeReasonDetailsPage(req)
  {
    viewport.showPage(new DowntimeReasonDetailsPage({downtimeReasonId: req.params.id}));
  });

  router.map('/downtimeReasons;add', canManage, function showAddDowntimeReasonFormPage()
  {
    viewport.showPage(new AddDowntimeReasonFormPage());
  });

  router.map('/downtimeReasons/:id;edit', canManage, function showEditDowntimeReasonFormPage(req)
  {
    viewport.showPage(new EditDowntimeReasonFormPage({downtimeReasonId: req.params.id}));
  });

  router.map(
    '/downtimeReasons/:id;delete',
    canManage,
    function showDeleteDowntimeReasonFormPage(req, referer)
    {
      viewport.showPage(new DowntimeReasonActionFormPage({
        downtimeReasonId: req.params.id,
        actionKey: 'delete',
        successUrl: '#downtimeReasons',
        cancelUrl: '#' + (referer || '/downtimeReasons').substr(1),
        formMethod: 'DELETE',
        formAction: '/downtimeReasons/' + req.params.id,
        formActionSeverity: 'danger'
      }));
    }
  );

});
