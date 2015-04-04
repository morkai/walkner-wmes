// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","./pages/ProdLogEntryListPage","i18n!app/nls/prodLogEntries"],function(r,e,n,o){"use strict";var t=n.auth("LOCAL","PROD_DATA:VIEW");r.map("/prodLogEntries",t,function(r){e.showPage(new o({rql:r.rql}))})});