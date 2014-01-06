define([
  '../router',
  '../viewport',
  '../user',
  './PressWorksheet',
  './pages/PressWorksheetListPage',
  './pages/PressWorksheetAddFormPage',
  './pages/PressWorksheetDetailsPage',
  'i18n!app/nls/pressWorksheets'
], function(
  router,
  viewport,
  user,
  PressWorksheet,
  PressWorksheetListPage,
  PressWorksheetAddFormPage,
  PressWorksheetDetailsPage
) {
  'use strict';

  var canView = user.auth('PRESS_WORKSHEETS:VIEW');
  var canManage = user.auth('PRESS_WORKSHEETS:MANAGE');

  router.map('/pressWorksheets', canView, function(req)
  {
    viewport.showPage(new PressWorksheetListPage({rql: req.rql}));
  });

  router.map('/pressWorksheets/:id', function(req)
  {
    viewport.showPage(new PressWorksheetDetailsPage({
      model: new PressWorksheet({_id: req.params.id})
    }));
  });

  router.map('/pressWorksheets;add', canManage, function()
  {
    viewport.showPage(new PressWorksheetAddFormPage({
      model: new PressWorksheet()
    }));
  });
});
