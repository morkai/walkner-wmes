// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","i18n!app/nls/orderDocumentClients"],function(e,n,t){"use strict";var r=t.auth("DOCUMENTS:VIEW");e.map("/orderDocuments/clients",r,function(e){n.loadPage(["app/orderDocumentClients/OrderDocumentClientCollection","app/orderDocumentClients/pages/OrderDocumentClientListPage"],function(n,t){return new t({collection:new n(null,{rqlQuery:e.rql})})})})});