define(["app/i18n","app/user","app/core/views/ListView","app/orderStatuses/templates/_orderStatus","i18n!app/nls/orderStatuses"],function(e,t,n,r){return n.extend({serializeColumns:function(){return[{id:"coloredId",label:e("orderStatuses","PROPERTY:_id")},{id:"label",label:e("orderStatuses","PROPERTY:label")}]},serializeRows:function(){return this.collection.toJSON().map(function(e){return e.coloredId=r(e),e})}})});