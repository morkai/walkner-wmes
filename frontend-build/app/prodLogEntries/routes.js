// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user"],function(r,n,e){"use strict";var o=e.auth("LOCAL","PROD_DATA:VIEW");r.map("/prodLogEntries",o,function(r){n.loadPage(["app/prodLogEntries/pages/ProdLogEntryListPage","i18n!app/nls/prodLogEntries"],function(n){return new n({rql:r.rql})})})});