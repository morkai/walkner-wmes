// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  router.map('/orderDocuments/clients', user.auth('DOCUMENTS:VIEW'), function(req)
  {
    viewport.loadPage(
      [
        'app/orderDocumentClients/OrderDocumentClientCollection',
        'app/orderDocumentClients/pages/OrderDocumentClientListPage',
        'css!app/orderDocumentClients/assets/main',
        'i18n!app/nls/orderDocumentClients'
      ],
      function(OrderDocumentClientCollection, OrderDocumentClientListPage)
      {
        return new OrderDocumentClientListPage({
          collection: new OrderDocumentClientCollection(null, {
            rqlQuery: req.rql
          })
        });
      }
    );
  });
});
