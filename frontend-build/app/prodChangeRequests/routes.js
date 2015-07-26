// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","./ProdChangeRequestCollection","./pages/ProdChangeRequestListPage","i18n!app/nls/prodChangeRequests"],function(e,n,t,o,r){"use strict";var s=t.auth("LOCAL","PROD_DATA:VIEW","PROD_DATA:CHANGES:REQUEST");e.map("/prodChangeRequests",s,function(e){n.showPage(new r({collection:new o(null,{rqlQuery:e.rql})}))})});