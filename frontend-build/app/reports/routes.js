define(["../user","../router","../viewport","i18n!app/nls/reports"],function(e,r,t){r.map("/reports/1",e.auth("REPORTS:VIEW"),function(e){return t.currentPage&&"report1"===t.currentPage.pageId?t.currentPage.query.reset(e.query):(t.loadPage("app/reports/pages/Report1Page",function(r){return new r({query:e.query})}),void 0)})});