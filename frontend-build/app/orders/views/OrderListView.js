// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/user","app/core/views/ListView","app/data/orderStatuses","app/orderStatuses/util/renderOrderStatusLabel","../util/openOrderPrint","../util/resolveProductName"],function(e,s,t,i,a,r,n,o){"use strict";return i.extend({className:"orders-list is-clickable",localTopics:{"orderStatuses.synced":"render"},remoteTopics:{"orders.synced":"refreshCollection","orders.updated.*":function(e){this.collection.get(e._id)&&this.refreshCollection()}},events:e.extend({"click .action-print":function(e){return n(e,e.currentTarget)}},i.prototype.events),columns:[{id:"_id",className:"is-min"},{id:"nc12",className:"is-min"},{id:"name",className:"is-min"},{id:"mrp",className:"is-min"},{id:"qtys",className:"is-min is-number"},{id:"sapCreatedAtText",label:s.bound("orders","PROPERTY:sapCreatedAt"),className:"is-min"},{id:"startDateText",label:s.bound("orders","PROPERTY:startDate"),className:"is-min"},{id:"finishDateText",label:s.bound("orders","PROPERTY:finishDate"),className:"is-min"},{id:"delayReason",className:"is-min"},{id:"statusLabels",label:s.bound("orders","PROPERTY:statuses")}],serializeActions:function(){var e=this.collection;return function(t){return[i.actions.viewDetails(e.get(t._id)),{id:"print",icon:"print",label:s.bound("orders","LIST:ACTION:print"),href:"/orders/"+t._id+".html?print"}]}},serializeRows:function(){var e=this.delayReasons;return this.collection.map(function(s){var t=s.toJSON(),i=e.get(t.delayReason);return t.name=o(t),t.statusLabels=a.findAndFill(t.statuses).map(r).join(""),t.delayReason=i?i.getLabel():"",t})}})});