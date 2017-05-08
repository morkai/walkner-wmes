// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

  router.map('/orderDocuments/tree', user.auth('DOCUMENTS:VIEW'), function(req)
  {
    viewport.loadPage(
      [
        'app/orderDocumentTree/uploads',
        'app/orderDocumentTree/OrderDocumentTree',
        'app/orderDocumentTree/pages/OrderDocumentTreePage',
        'i18n!app/nls/orderDocumentTree'
      ],
      function(uploads, OrderDocumentTree, OrderDocumentTreePage)
      {
        return new OrderDocumentTreePage({
          model: new OrderDocumentTree({
            selectedFile: req.query.file || null,
            selectedFolder: req.query.folder || null,
            searchPhrase: req.query.search || ''
          }, {
            uploads: uploads
          })
        });
      }
    );
  });
});
