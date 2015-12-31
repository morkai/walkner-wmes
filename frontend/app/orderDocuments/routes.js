// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
