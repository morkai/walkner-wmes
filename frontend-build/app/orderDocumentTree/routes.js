define(["../router","../viewport","../user"],function(e,r,u){"use strict";e.map("/orderDocuments/tree",u.auth("USER","DOCUMENTS:VIEW"),function(e){r.currentPage&&r.currentPage.$el.hasClass("orderDocumentTree-page")?r.currentPage.model.setSelectedFolder(e.query.folder||null,{scroll:!0,updateUrl:!1}):r.loadPage(["app/orderDocumentTree/uploads","app/orderDocumentTree/OrderDocumentTree","app/orderDocumentTree/pages/OrderDocumentTreePage","css!app/orderDocumentTree/assets/main","i18n!app/nls/orderDocumentTree"],function(r,u,o){return new o({model:new u({selectedFile:e.query.file||null,selectedFolder:e.query.folder||null,searchPhrase:e.query.search||"",dateFilter:e.query.date||null},{uploads:r})})})})});