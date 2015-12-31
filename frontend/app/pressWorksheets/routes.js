// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './PressWorksheet'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  PressWorksheet
) {
  'use strict';

  var nls = 'i18n!app/nls/pressWorksheets';
  var canView = user.auth('LOCAL', 'PROD_DATA:VIEW', 'PRESS_WORKSHEETS:VIEW');
  var canManage = user.auth('PRESS_WORKSHEETS:MANAGE');

  router.map('/pressWorksheets', canView, function(req)
  {
    viewport.loadPage(
      ['app/pressWorksheets/pages/PressWorksheetListPage', nls],
      function(PressWorksheetListPage)
      {
        return new PressWorksheetListPage({rql: req.rql});
      }
    );
  });

  router.map('/pressWorksheets;add', canManage, function()
  {
    viewport.loadPage(
      ['app/pressWorksheets/pages/PressWorksheetAddFormPage', nls],
      function(PressWorksheetAddFormPage)
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
      ['app/pressWorksheets/pages/PressWorksheetDetailsPage', nls],
      function(PressWorksheetDetailsPage)
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
      ['app/pressWorksheets/pages/PressWorksheetEditFormPage', nls],
      function(PressWorksheetEditFormPage)
      {
        return new PressWorksheetEditFormPage({
          model: new PressWorksheet({_id: req.params.id})
        });
      }
    );
  });

  router.map('/pressWorksheets/:id;delete', canManage, showDeleteFormPage.bind(null, PressWorksheet));
});
