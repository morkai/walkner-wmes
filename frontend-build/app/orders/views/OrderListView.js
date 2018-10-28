define(["underscore","app/i18n","app/user","app/core/views/ListView","app/data/orderStatuses","app/orderStatuses/util/renderOrderStatusLabel","app/printers/views/PrinterPickerView","../util/openOrderPrint"],function(e,s,i,t,r,n,a,d){"use strict";return t.extend({className:"orders-list is-clickable",localTopics:{"orderStatuses.synced":"render"},remoteTopics:{"orders.synced":"refreshCollection","orders.updated.*":function(e){this.collection.get(e._id)&&this.refreshCollection()}},events:e.extend({"click .action-print":function(e){var s=this.$(e.currentTarget).closest("tr").attr("data-id");return e.listAction={view:this,tag:"orders"},a.listAction(e,function(e){d([s],e)}),!1}},t.prototype.events),columns:[{id:"_id",className:"is-min"},{id:"nc12",className:"is-min"},{id:"name",className:"is-min"},{id:"mrp",className:"is-min"},{id:"qtys",className:"is-min is-number"},{id:"sapCreatedAtText",label:s.bound("orders","PROPERTY:sapCreatedAt"),className:"is-min"},{id:"scheduledStartDateText",label:s.bound("orders","PROPERTY:scheduledStartDate"),className:"is-min"},{id:"delayReason",className:"is-min"},{id:"m4",className:"is-min"},{id:"statusLabels",label:s.bound("orders","PROPERTY:statuses")}],serializeActions:function(){var e=this.collection;return function(i){return[t.actions.viewDetails(e.get(i._id)),{id:"print",icon:"print",label:s.bound("orders","LIST:ACTION:print"),href:"/orders/"+i._id+".html?print"}]}},serializeRows:function(){var e={delayReasons:this.delayReasons};return this.collection.map(function(s){return s.serialize(e)})}})});