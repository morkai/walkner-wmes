// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  './DocumentViewerState',
  './pages/DocumentViewerPage',
  'i18n!app/nls/orderDocuments'
], function(
  router,
  viewport,
  user,
  DocumentViewerState,
  DocumentViewerPage
) {
  'use strict';

  router.map('/', function()
  {
    viewport.showPage(new DocumentViewerPage({
      model: new DocumentViewerState({
        _id: window.location.pathname.match(/docs\/(.*?)$/)[1]
      })
    }));
  });
});
