define(["../router","../viewport","../user","./pages/ProdLogEntryListPage","i18n!app/nls/prodLogEntries"],function(r,e,n,o){var t=n.auth("PROD_DATA:VIEW");r.map("/prodLogEntries",t,function(r){e.showPage(new o({rql:r.rql}))})});