// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user"],function(e,r,o){"use strict";e.map("/orderDocuments/tree",o.auth("DOCUMENTS:VIEW"),function(e){if(r.currentPage&&r.currentPage.$el.hasClass("orderDocumentTree-page"))return void r.currentPage.model.setSelectedFolder(e.query.folder||null,{scroll:!0,updateUrl:!1});r.loadPage(["app/orderDocumentTree/uploads","app/orderDocumentTree/OrderDocumentTree","app/orderDocumentTree/pages/OrderDocumentTreePage","i18n!app/nls/orderDocumentTree"],function(r,o,u){return new u({model:new o({selectedFile:e.query.file||null,selectedFolder:e.query.folder||null,searchPhrase:e.query.search||""},{uploads:r})})})})});