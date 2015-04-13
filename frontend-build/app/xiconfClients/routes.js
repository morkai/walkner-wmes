// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","i18n!app/nls/xiconf","i18n!app/nls/xiconfClients"],function(n,i,e){"use strict";var t=e.auth("XICONF:VIEW");n.map("/xiconf/clients",t,function(n){i.loadPage(["app/xiconfClients/XiconfClientCollection","app/xiconfClients/pages/XiconfClientListPage"],function(i,e){return new e({collection:new i(null,{rqlQuery:n.rql})})})})});