// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var css = 'css!app/pressWorksheets/assets/main';
  var nls = 'i18n!app/nls/pressWorksheets';
  var canView = user.auth('PROD_DATA:VIEW', 'PRESS_WORKSHEETS:VIEW');
  var canManage = user.auth('PRESS_WORKSHEETS:MANAGE');

  router.map('/pressWorksheets', canView, function(req)
  {
    viewport.loadPage(
      ['app/pressWorksheets/pages/PressWorksheetListPage', css, nls],
      function(PressWorksheetListPage)
      {
        return new PressWorksheetListPage({rql: req.rql});
      }
    );
  });

  router.map('/pressWorksheets;add', canManage, function()
  {
    viewport.loadPage(
      ['app/pressWorksheets/PressWorksheet', 'app/pressWorksheets/pages/PressWorksheetAddFormPage', css, nls],
      function(PressWorksheet, PressWorksheetAddFormPage)
      {
        return new PressWorksheetAddFormPage({
          model: new PressWorksheet()
        });
      }
    );
  });

  router.map('/pressWorksheets/:id', canView, function(req)
  {
    viewport.loadPage(
      ['app/pressWorksheets/PressWorksheet', 'app/pressWorksheets/pages/PressWorksheetDetailsPage', css, nls],
      function(PressWorksheet, PressWorksheetDetailsPage)
      {
        return new PressWorksheetDetailsPage({
          model: new PressWorksheet({_id: req.params.id})
        });
      }
    );
  });

  router.map('/pressWorksheets/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/pressWorksheets/PressWorksheet', 'app/pressWorksheets/pages/PressWorksheetEditFormPage', css, nls],
      function(PressWorksheet, PressWorksheetEditFormPage)
      {
        return new PressWorksheetEditFormPage({
          model: new PressWorksheet({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/pressWorksheets/:id;delete',
    canManage,
    showDeleteFormPage.bind(null, 'app/pressWorksheets/PressWorksheet')
  );
});
