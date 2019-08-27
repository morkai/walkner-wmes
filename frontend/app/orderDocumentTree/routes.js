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

  router.map('/orderDocuments/tree', user.auth('USER', 'DOCUMENTS:VIEW'), function(req)
  {
    if (viewport.currentPage && viewport.currentPage.$el.hasClass('orderDocumentTree-page'))
    {
      viewport.currentPage.model.setSelectedFolder(req.query.folder || null, {
        scroll: true,
        updateUrl: false
      });

      return;
    }

    viewport.loadPage(
      [
        'app/orderDocumentTree/uploads',
        'app/orderDocumentTree/OrderDocumentTree',
        'app/orderDocumentTree/pages/OrderDocumentTreePage',
        'css!app/orderDocumentTree/assets/main',
        'i18n!app/nls/orderDocumentTree'
      ],
      function(uploads, OrderDocumentTree, OrderDocumentTreePage)
      {
        return new OrderDocumentTreePage({
          model: new OrderDocumentTree({
            selectedFile: req.query.file || null,
            selectedFolder: req.query.folder || null,
            searchPhrase: req.query.search || '',
            dateFilter: req.query.date || null
          }, {
            uploads: uploads
          })
        });
      }
    );
  });
});
