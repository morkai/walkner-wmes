define(["underscore","app/i18n","app/viewport","app/core/View","app/printers/views/PrinterPickerView","../util/openOrderPrint","app/orders/templates/openOrdersPrint"],function(r,e,i,t,n,s,o){"use strict";return t.extend({template:o,events:{"input #-orders":function(r){r.target.setCustomValidity("")},"change #-orders":function(){this.$id("orders").val(this.serializeOrders().join(", "))},submit:function(){return this.findAndPrint(this.serializeOrders()),!1}},afterRender:function(){n.selectField(this,{tag:"orders"})},onDialogShown:function(){this.$id("orders").focus()},serializeOrders:function(){return this.$id("orders").val().split(/[^0-9]/).filter(function(r){return!!r.length})},findAndPrint:function(t){var n=this,o=this.ajax({url:"/orders?select(_id)&limit(100)&_id=in=("+t+")"});o.fail(function(){i.msg.error({type:"error",time:3e3,text:e("orders","openOrdersPrint:msg:findFailure")})}),o.done(function(i){if(i.totalCount!==t.length){var o=r.pluck(i.collection,"_id"),d=r.filter(t,function(e){return!r.includes(o,e)});return n.$id("orders")[0].setCustomValidity(e("orders","openOrdersPrint:msg:notFound",{count:d.length,orders:d.join(", ")})),void n.$id("submit").click()}s(t,n.$id("printer").val()||null)})}})});