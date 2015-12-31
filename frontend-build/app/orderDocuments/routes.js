// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user","./DocumentViewerState","./pages/DocumentViewerPage","i18n!app/nls/orderDocuments"],function(e,n,o,t,i){"use strict";e.map("/",function(){n.showPage(new i({model:new t({_id:window.location.pathname.match(/docs\/(.*?)$/)[1]})}))})});