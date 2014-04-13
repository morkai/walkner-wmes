define(["app/i18n","app/user","app/core/views/ListView","app/data/orderStatuses","app/orderStatuses/templates/_orderStatus"],function(e,r,t,s,i){return t.extend({localTopics:{"orderStatuses.synced":"render"},remoteTopics:{"orders.synced":"refreshCollection","orders.added":"refreshCollection","orders.edited":"refreshCollection","orders.deleted":"onModelDeleted"},serializeColumns:function(){return[{id:"_id",label:e("orders","PROPERTY:_id")},{id:"nc12",label:e("orders","PROPERTY:nc12")},{id:"name",label:e("orders","PROPERTY:name")},{id:"mrp",label:e("orders","PROPERTY:mrp")},{id:"qtyUnit",label:e("orders","PROPERTY:qty")},{id:"startDateText",label:e("orders","PROPERTY:startDate")},{id:"finishDateText",label:e("orders","PROPERTY:finishDate")},{id:"statusLabels",label:e("orders","PROPERTY:statuses")}]},serializeActions:function(){var e=this.collection;return function(r){return[t.actions.viewDetails(e.get(r._id))]}},serializeRows:function(){return this.collection.toJSON().map(function(e){return e.statusLabels=s.findAndFill(e.statuses).map(function(e){return i(e)}).join(""),e})}})});