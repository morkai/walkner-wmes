// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './PressWorksheet',
  'i18n!app/nls/pressWorksheets'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  PressWorksheet
) {
  'use strict';

  var canView = user.auth('LOCAL', 'PROD_DATA:VIEW', 'PRESS_WORKSHEETS:VIEW');
  var canManage = user.auth('PRESS_WORKSHEETS:MANAGE');

  router.map('/pressWorksheets', canView, function(req)
  {
    viewport.loadPage(['app/pressWorksheets/pages/PressWorksheetListPage'], function(PressWorksheetListPage)
    {
      return new PressWorksheetListPage({rql: req.rql});
    });
  });

  router.map('/pressWorksheets;add', canManage, function()
  {
    viewport.loadPage(['app/pressWorksheets/pages/PressWorksheetAddFormPage'], function(PressWorksheetAddFormPage)
    {
      return new PressWorksheetAddFormPage({
        model: new PressWorksheet()
      });
    });
  });

  router.map('/pressWorksheets/:id', canView, function(req)
  {
    viewport.loadPage(['app/pressWorksheets/pages/PressWorksheetDetailsPage'], function(PressWorksheetDetailsPage)
    {
      return new PressWorksheetDetailsPage({
        model: new PressWorksheet({_id: req.params.id})
      });
    });
  });

  router.map('/pressWorksheets/:id;edit', canManage, function(req)
  {
    viewport.loadPage(['app/pressWorksheets/pages/PressWorksheetEditFormPage'], function(PressWorksheetEditFormPage)
    {
      return new PressWorksheetEditFormPage({
        model: new PressWorksheet({_id: req.params.id})
      });
    });
  });

  router.map('/pressWorksheets/:id;delete', canManage, showDeleteFormPage.bind(null, PressWorksheet));
});
