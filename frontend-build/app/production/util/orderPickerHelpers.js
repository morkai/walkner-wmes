// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","app/viewport","app/i18n"],function(e,r,t,n){return{createGetOrdersUrl:function(e,r){return function(t){var n=e.getOrderIdType();return r.attr("data-type",n),"/production/orders?"+n+"="+encodeURIComponent(t)}},setUpOrderSelect2:function(o,a,i,s){function l(e){return-1!==e.laborTime&&""!==e.workCenter}var d=this;o.removeClass("form-control").select2(e.extend({openOnEnter:null,allowClear:!1,minimumInputLength:6,ajax:{cache:!0,quietMillis:300,url:d.createGetOrdersUrl(i,o),results:function(e){return{results:(Array.isArray(e)?e:[]).map(function(e){return e.id=e._id,e.text=e._id+" - "+(e.name||"?"),e})}},transport:function(e){return r.ajax.apply(r,arguments).fail(function(){t.msg.show({type:"error",time:2e3,text:n("production","newOrderPicker:msg:searchFailure")}),e.success({collection:[]})})}}},s)),o.on("change",function(r){var t;t=Array.isArray(r.operations)?r.operations.filter(l):r.added&&Array.isArray(r.added.operations)?r.added.operations.filter(l):[],d.setUpOperationSelect2(a,t.map(function(e){return{id:e.no,text:e.no+" - "+e.name}}),s,!0),t.length?a.select2("val",r.selectedOperationNo||t[0].no).select2("focus"):(r.selectedOperationNo&&a.val(r.selectedOperationNo),e.defer(function(){a.focus()}))})},setUpOperationSelect2:function(t,o,a,i){return t.prev(".message-warning").remove(),i&&!o.length?(t.select2("destroy").addClass("form-control").val("").attr("title",""),void r('<p class="message message-inline message-warning"></p>').html(n("production","newOrderPicker:msg:noOperations")).insertBefore(t)):void t.removeClass("form-control").select2(e.extend({width:"100%",placeholder:n("production","newOrderPicker:online:operation:placeholder"),openOnEnter:null,allowClear:!1,minimumResultsForSearch:-1,data:o||[],shouldFocusInput:function(){return!0}},a))},selectOrder:function(r,t){var n=t.get("orderId"),o=t.get("orderData");n&&o&&(r.select2("data",{id:n,text:n+" - "+(o.name||"?"),sameOrder:!0}),r.trigger({type:"change",operations:e.values(o.operations),selectedOperationNo:t.get("operationNo")}))},prepareOrderInfo:function(r,t){if(delete t.__v,delete t.id,delete t.text,t._id&&("no"===r.getOrderIdType()?t.no=t._id:(t.no=null,t.nc12=t._id),delete t._id),Array.isArray(t.operations)){var n={};t.operations.forEach(function(e){""!==e.workCenter&&-1!==e.laborTime&&(n[e.no]=e)}),t.operations=n}else e.isObject(t.operations)||(t.operations={})}}});