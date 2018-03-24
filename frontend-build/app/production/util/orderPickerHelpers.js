// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/viewport","app/i18n"],function(e,r,t,n){"use strict";return{createGetOrdersUrl:function(e,r){return function(t){var n=e.getOrderIdType();return r.attr("data-type",n),"/production/orders?"+n+"="+encodeURIComponent(t)}},setUpOrderSelect2:function(o,a,i,s){function l(e){return-1!==e.laborTime&&""!==e.workCenter}var c=this;o.removeClass("form-control").select2(e.extend({openOnEnter:null,allowClear:!1,minimumInputLength:6,ajax:{cache:!0,quietMillis:300,url:c.createGetOrdersUrl(i,o),results:function(e){return{results:(Array.isArray(e)?e:[]).map(function(e){return e.id=e._id,e.text=e._id+" - "+(e.description||e.name||"?"),e})}},transport:function(e){return r.ajax.apply(r,arguments).fail(function(){t.msg.show({type:"error",time:2e3,text:n("production","newOrderPicker:msg:searchFailure")}),e.success({collection:[]})})}}},s)),o.on("change",function(r){var t;t=Array.isArray(r.operations)?r.operations.filter(l):r.added&&Array.isArray(r.added.operations)?r.added.operations.filter(l):[],c.setUpOperationSelect2(a,t.map(function(e){return{id:e.no,text:e.no+" - "+e.name}}),s,!r.removed),t.length?a.select2("val",r.selectedOperationNo||c.getBestDefaultOperationNo(t)).select2("focus"):(r.selectedOperationNo&&a.val(r.selectedOperationNo),e.defer(function(){a.focus()}))})},setUpOperationSelect2:function(t,o,a,i){if(t.prev(".message-warning").remove(),i&&!o.length)return t.select2("destroy").addClass("form-control").val("").attr("title",""),void r('<p class="message message-inline message-warning"></p>').html(n("production","newOrderPicker:msg:noOperations")).insertBefore(t);t.removeClass("form-control").select2(e.extend({width:"100%",placeholder:n("production","newOrderPicker:online:operation:placeholder"),openOnEnter:null,allowClear:!1,minimumResultsForSearch:-1,data:o||[],shouldFocusInput:function(){return!0}},a))},selectOrder:function(r,t){if(t){var n=t.get("orderId"),o=t.get("orderData");n&&o&&(r.select2("data",{id:n,text:n+" - "+(o.description||o.name||"?"),sameOrder:!0}),r.trigger({type:"change",operations:e.values(o.operations),selectedOperationNo:t.get("operationNo")}))}},prepareOrderInfo:function(r,t){if(delete t.__v,delete t.id,delete t.text,t._id&&("no"===r.getOrderIdType()?t.no=t._id:(t.no=null,t.nc12=t._id),delete t._id),Array.isArray(t.operations)){var n={};t.operations.forEach(function(e){""!==e.workCenter&&-1!==e.laborTime&&(n[e.no]=e)}),t.operations=n}else e.isObject(t.operations)||(t.operations={});return t},getBestDefaultOperationNo:function(e){var r=this.getBestDefaultOperation(e);return r?r.no:null},getBestDefaultOperation:function(e){return Array.isArray(e)&&0!==e.length?1===e.length?e[0]:e.map(function(e){var r=0;return e.laborTime>0&&(r+=1),e.workCenter&&(r+=1),/mont/i.test(e.name)&&(r+=2),/g..wn/i.test(e.name)&&(r+=1),/pak/i.test(e.name)&&(r+=1),/kj/i.test(e.name)&&(r+=1),/opra/i.test(e.name)&&(r+=1),/z.o.en/i.test(e.name)&&(r+=1),{op:e,rank:r}}).sort(function(e,r){return r.rank-e.rank}).shift().op:null}}});