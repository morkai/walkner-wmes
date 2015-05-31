// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","./DocumentViewerState","./pages/DocumentViewerPage","i18n!app/nls/orderDocuments"],function(e,n,o,t,i){"use strict";e.map("/",function(){n.showPage(new i({model:new t({_id:window.location.pathname.match(/docs\/(.*?)$/)[1]})}))})});