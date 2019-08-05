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

  var canView = user.auth('DOCUMENTS:VIEW');

  router.map('/orderDocuments/confirmations', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/orderDocumentConfirmations/OrderDocumentConfirmationCollection',
        'app/orderDocumentConfirmations/pages/OrderDocumentConfirmationListPage',
        'i18n!app/nls/orderDocumentConfirmations'
      ],
      function(Collection, ListPage)
      {
        return new ListPage({
          collection: new Collection(null, {
            rqlQuery: req.rql
          })
        });
      }
    );
  });
});
