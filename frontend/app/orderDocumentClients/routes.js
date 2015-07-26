// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  'i18n!app/nls/orderDocumentClients'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  var canView = user.auth('DOCUMENTS:VIEW');

  router.map('/orderDocuments/clients', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/orderDocumentClients/OrderDocumentClientCollection',
        'app/orderDocumentClients/pages/OrderDocumentClientListPage'
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
