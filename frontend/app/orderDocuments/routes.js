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
    var matches = window.location.pathname.match(/doc(?:ument)?s\/(.*?)$/);
    var clientId = window.COMPUTERNAME;

    if (matches)
    {
      clientId = matches[1];
    }

    if (!clientId)
    {
      clientId = localStorage.DOCS_CLIENT_ID || 'DOCS-' + Date.now();
    }

    localStorage.DOCS_CLIENT_ID = clientId;

    viewport.showPage(new DocumentViewerPage({
      model: new DocumentViewerState({
        _id: clientId
      })
    }));
  });
});
