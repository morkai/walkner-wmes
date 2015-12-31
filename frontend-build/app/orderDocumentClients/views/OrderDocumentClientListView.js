// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/time","app/user","app/viewport","app/core/views/ListView"],function(e,i,s,n,c,o){"use strict";return o.extend({className:"orderDocumentClients-list is-colored",remoteTopics:{"orderDocuments.clients.**":"refreshCollection"},columns:[{id:"_id",className:"is-min"},{id:"prodLine",className:"is-min"},{id:"fileSource",className:"is-min"},{id:"orderNo",className:"is-min"},{id:"orderNc12",className:"is-min"},{id:"orderName",className:"is-min"},{id:"documentNc15",className:"is-min"},{id:"documentName",className:"is-min"},{id:"lastSeenAt"}],serializeActions:function(){var e=this.collection,i=n.isAllowedTo("DOCUMENTS:MANAGE");return function(s){var n=e.get(s._id),c=[];return i&&null===s.connectedAt&&c.push(o.actions["delete"](n)),c}}})});