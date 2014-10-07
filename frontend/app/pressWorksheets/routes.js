// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './PressWorksheet',
  './pages/PressWorksheetListPage',
  './pages/PressWorksheetDetailsPage',
  './pages/PressWorksheetAddFormPage',
  './pages/PressWorksheetEditFormPage',
  'i18n!app/nls/pressWorksheets'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  PressWorksheet,
  PressWorksheetListPage,
  PressWorksheetDetailsPage,
  PressWorksheetAddFormPage,
  PressWorksheetEditFormPage
) {
  'use strict';

  var canView = user.auth('LOCAL', 'PRESS_WORKSHEETS:VIEW');
  var canManage = user.auth('PRESS_WORKSHEETS:MANAGE');

  router.map('/pressWorksheets', canView, function(req)
  {
    viewport.showPage(new PressWorksheetListPage({rql: req.rql}));
  });

  router.map('/pressWorksheets;add', canManage, function()
  {
    viewport.showPage(new PressWorksheetAddFormPage({
      model: new PressWorksheet()
    }));
  });

  router.map('/pressWorksheets/:id', canView, function(req)
  {
    viewport.showPage(new PressWorksheetDetailsPage({
      model: new PressWorksheet({_id: req.params.id})
    }));
  });

  router.map('/pressWorksheets/:id;edit', canManage, function(req)
  {
    viewport.showPage(new PressWorksheetEditFormPage({
      model: new PressWorksheet({_id: req.params.id})
    }));
  });

  router.map(
    '/pressWorksheets/:id;delete', canManage, showDeleteFormPage.bind(null, PressWorksheet)
  );
});
