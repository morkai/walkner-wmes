define(["moment","../core/Model","app/orders/OperationCollection"],function(e,t,n){return t.extend({urlRoot:"/mechOrders",clientUrlRoot:"#mechOrders",topicPrefix:"mechOrders",privilegePrefix:"ORDERS",nlsDomain:"mechOrders",labelAttribute:"_id",defaults:{name:null,operations:null,importTs:null},parse:function(e,i){return e=t.prototype.parse.call(this,e,i),e.operations=new n(e.operations),e},toJSON:function(){var n=t.prototype.toJSON.call(this);return n.importTs&&(n.importTs=e(n.importTs).format("YYYY-MM-DD HH:mm:ss")),n.operations=null===n.operations?[]:n.operations.toJSON(),n}})});