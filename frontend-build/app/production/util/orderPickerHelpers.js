define(["underscore","jquery","app/viewport","app/i18n"],function(e,t,r,n){"use strict";return{createGetOrdersUrl:function(e,t){return function(r){var n=e.getOrderIdType();return t.attr("data-type",n),"/production/orders?"+n+"="+encodeURIComponent(r)}},setUpOrderSelect2:function(o,a,i,s){var l=this;function u(e){return-1!==e.laborTime&&""!==e.workCenter}o.removeClass("form-control").select2(e.assign({openOnEnter:null,allowClear:!1,minimumInputLength:6,ajax:{cache:!0,quietMillis:300,url:l.createGetOrdersUrl(i,o),results:function(e){return{results:(Array.isArray(e)?e:[]).map(function(e){return e.id=e._id,e.text=e._id+" - "+(e.description||e.name||"?"),e})}},transport:function(e){return t.ajax.apply(t,arguments).fail(function(){r.msg.show({type:"error",time:2e3,text:n("production","newOrderPicker:msg:searchFailure")}),e.success({collection:[]})})}}},s)),o.on("change",function(t){var r;r=Array.isArray(t.operations)?t.operations.filter(u):t.added&&Array.isArray(t.added.operations)?t.added.operations.filter(u):[],l.setUpOperationSelect2(a,r.map(function(e){return{id:e.no,text:e.no+" - "+e.name}}),s,!t.removed),r.length?a.select2("val",t.selectedOperationNo||l.getBestDefaultOperationNo(r)).select2("focus"):(t.selectedOperationNo&&a.val(t.selectedOperationNo),e.defer(function(){a.focus()}))})},setUpOperationSelect2:function(r,o,a,i){if(r.prev(".message-warning").remove(),i&&!o.length)return r.select2("destroy").addClass("form-control").val("").attr("title",""),void t('<p class="message message-inline message-warning"></p>').html(n("production","newOrderPicker:msg:noOperations")).insertBefore(r);r.removeClass("form-control").select2(e.assign({width:"100%",placeholder:" ",openOnEnter:null,allowClear:!1,minimumResultsForSearch:-1,data:o||[],shouldFocusInput:function(){return!0}},a))},selectOrder:function(t,r){if(r){var n=r.get("orderId"),o=r.get("orderData");n&&o&&(t.select2("data",{id:n,text:n+" - "+(o.description||o.name||"?"),sameOrder:!0}),t.trigger({type:"change",operations:e.values(o.operations),selectedOperationNo:r.get("operationNo")}))}},prepareOrderInfo:function(e,t){return delete t.__v,delete t.id,delete t.text,t._id&&("no"===e.getOrderIdType()?t.no=t._id:(t.no=null,t.nc12=t._id),delete t._id),t.operations=this.prepareOperations(t.operations),t},prepareOperations:function(t){if(Array.isArray(t)){var r={};return t.forEach(function(e){""===e.workCenter||-1===e.laborTime||r[e.no]||(r[e.no]=e)}),r}return e.isObject(t)?t:{}},getBestDefaultOperationNo:function(e){var t=this.getBestDefaultOperation(e);return t?t.no:null},getBestDefaultOperation:function(e){return Array.isArray(e)&&0!==e.length?1===e.length?e[0]:e.map(function(e){var t=0;return e.laborTime>0&&(t+=1),e.workCenter&&(t+=1),/^monta/i.test(e.name)&&(t+=1),/monta/i.test(e.name)&&(t+=2),/g..wn/i.test(e.name)&&(t+=1),/pak/i.test(e.name)&&(t+=1),/kj/i.test(e.name)&&(t+=1),/opra/i.test(e.name)&&(t+=1),/z.o.en/i.test(e.name)&&(t+=1),{op:e,rank:t}}).sort(function(e,t){return t.rank-e.rank}).shift().op:null}}});