// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../time","../i18n","../core/Model"],function(e,r,o,t){"use strict";return t.extend({urlRoot:"/orderDocuments/clients",clientUrlRoot:"#orderDocuments/clients",privilegePrefix:"DOCUMENTS",nlsDomain:"orderDocumentClients",serialize:function(){var e=this.toJSON(),t=e.orderInfo||{};e.className=e.connectedAt?"success":"danger",e.lastSeenAt=r.format(e.connectedAt||e.disconnectedAt,"L, LTS"),e.fileSource=t.fileSource?o("orderDocumentClients","fileSource:"+t.fileSource):"-",t.orderNo&&(e.orderNo='<a href="#orders/'+t.orderNo+'">'+t.orderNo+"</a>",e.orderNc12=t.orderNc12,e.orderName=t.orderName);var n=t.documentNc15;return n&&(e.documentNc15=15!==n.length?n:'<a href="/orderDocuments/'+n+'" target=_blank>'+n+"</a>",e.documentName=t.documentName),e}})});