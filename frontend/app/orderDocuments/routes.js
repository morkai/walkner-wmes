// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  './DocumentViewerState',
  './pages/DocumentViewerPage',
  '../orders/pages/OrderDetailsPage',
  'i18n!app/nls/orderDocuments',
  'i18n!app/nls/orders'
], function(
  router,
  viewport,
  user,
  DocumentViewerState,
  DocumentViewerPage,
  OrderDetailsPage
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
      clientId = localStorage.getItem('DOCS_CLIENT_ID') || ('DOCS-' + Date.now());
    }

    localStorage.setItem('DOCS_CLIENT_ID', clientId);

    viewport.showPage(new DocumentViewerPage({
      model: new DocumentViewerState({
        _id: clientId
      })
    }));
  });

  router.map('/orders/:id', function(req)
  {
    viewport.showPage(new OrderDetailsPage({
      modelId: req.params.id
    }));
  });
});
