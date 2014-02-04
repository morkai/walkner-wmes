define(["underscore","jquery","app/i18n","app/viewport","app/data/downtimeReasons","app/data/prodLines","app/core/Model","app/core/views/FormView","app/pressWorksheets/templates/form","app/pressWorksheets/templates/orderRow","i18n!app/nls/pressWorksheets"],function(e,t,s,r,o,n,i,a,l,d){var p={cache:!0,quietMillis:500,url:function(e){return"/users?select(lastName,firstName)&sort(lastName,firstName)&limit(20)&regex(lastName,"+encodeURIComponent("^"+e)+",i)"},results:function(e){return{results:(e.collection||[]).map(function(e){return{id:e._id,text:e.lastName+" "+e.firstName}})}}};return a.extend({template:l,idPrefix:"pressWorksheetForm",events:{submit:"submitForm","blur .pressWorksheets-form-time":function(e){var t=e.target.value.trim().replace(/[^0-9: \-]+/g,""),s=t.match(/^([0-9]+)(?::| +|\-)+([0-9]+)$/),r=0,o=0;s?(r=parseInt(s[1],10),o=parseInt(s[2],10)):4===t.length?(r=parseInt(t.substr(0,2),10),o=parseInt(t.substr(2),10)):3===t.length?(r=parseInt(t[0],10),o=parseInt(t.substr(1),10)):o=parseInt(t,10),(isNaN(r)||r>=24)&&(r=0),(isNaN(o)||o>=60)&&(o=0),e.target.value=(10>r?"0":"")+r.toString(10)+":"+(10>o?"0":"")+o.toString(10)},"blur .pressWorksheets-form-count":function(e){var t=parseInt(e.target.value,10);e.target.value=isNaN(t)?"":t},"blur .pressWorksheets-form-quantityDone":function(e){var t=parseInt(e.target.value,10);e.target.value=isNaN(t)||0>t?0:t},"focus input":function(e){e.target.classList.contains("select2-focusser")&&e.target.parentNode.classList.contains("pressWorksheets-form-part")&&this.$(".table-responsive").prop("scrollLeft",0)},"change input[name=shift]":"validateShiftStartTime","change input[name=date]":"validateShiftStartTime"},initialize:function(){a.prototype.initialize.apply(this,arguments),this.lastOrderNo=-1,this.lossReasons=[],this.downtimeReasons=o.filter(function(e){return e.get("pressPosition")>=0}).map(function(e){return e.toJSON()}).sort(function(e,t){return e.pressPosition-t.pressPosition})},beforeRender:function(){this.lossReasons=this.model.lossReasons.toJSON()},afterRender:function(){a.prototype.afterRender.call(this),this.prodLinesData=n.filter(function(e){var t=e.getSubdivision();return t&&"press"===t.get("type")}).map(function(e){return{id:e.id,text:e.id}});var e=this.$id("operators").select2({width:"100%",allowClear:!0,multiple:!0,minimumInputLength:3,ajax:p}),t=this.$id("operator").select2({width:"100%",allowClear:!0,minimumInputLength:3,ajax:p});this.$id("master").select2({width:"100%",allowClear:!0,minimumInputLength:3,ajax:p}),this.addOrderRow(),e.select2("focus").on("change",function(){t.select2("data")||t.select2("data",e.select2("data")[0])})},serialize:function(){return e.extend(a.prototype.serialize.call(this),{rowspan:this.lossReasons.length||this.downtimeReasons.length?2:0,lossReasons:this.lossReasons,downtimeReasons:this.downtimeReasons})},serializeForm:function(e){function t(e){return{id:e.id,label:e.text}}var s=this.$(".pressWorksheets-form-order");return e.orders=(e.orders||[]).filter(function(e){return e.part&&e.part.length&&e.operation&&e.operation.length}).map(this.serializeOrder.bind(this,s,this.model.lossReasons)),e.operators=this.$id("operators").select2("data").map(t),e.operator=t(this.$id("operator").select2("data")),e.master=t(this.$id("master").select2("data")),e.shift=parseInt(e.shift,10),e},serializeOrder:function(t,s,r,n){var i=t.eq(n),a=i.find(".pressWorksheets-form-part").select2("data").data,l=e.find(a.operations,function(e){return e.no===r.operation}),d=[];r.losses&&Object.keys(r.losses).forEach(function(e){e=s.get(e),r.losses[e.id]>0&&d.push({_id:e.id,label:e.get("label"),count:r.losses[e.id]})});var p=[];return r.downtimes&&Object.keys(r.downtimes).forEach(function(e){e=o.get(e),r.downtimes[e.id]>0&&p.push({_id:e.id,label:e.get("label"),count:r.downtimes[e.id]})}),{prodLine:r.prodLine,nc12:a._id,name:a.name,operationNo:l.no,operationName:l.name,orderData:a,quantityDone:r.quantityDone,startedAt:r.startedAt,finishedAt:r.finishedAt,losses:d,downtimes:p}},validateShiftStartTime:function(){var e=this.$id("date"),t=parseInt(this.$("input[name=shift]:checked").val(),10),r=Date.parse(e.val())+216e5+8*(t-1)*36e5;e[0].setCustomValidity(r>Date.now()?s("pressWorksheets","FORM:ERROR:date"):"")},checkValidity:function(e){var t=Date.parse(e.date)+216e5+8*(e.shift-1)*36e5;if(t>Date.now())return!1;if(0===e.orders.length)return this.showFieldError(0,"part"),!1;var s=this;return!e.orders.some(function(e,t){return e.prodLine&&e.prodLine.length?isNaN(parseInt(e.quantityDone,10))?s.showFieldError(t,"quantityDone"):e.startedAt&&e.startedAt.length?e.finishedAt&&e.finishedAt.length?!1:s.showFieldError(t,"finishedAt"):s.showFieldError(t,"startedAt"):s.showFieldError(t,"prodLine")})},showFieldError:function(e,t){var o=this.$(".pressWorksheets-form-order").eq(e).find(".pressWorksheets-form-"+t);return o.hasClass("select2-offscreen")?o.select2("focus"):o.focus(),this.$errorMessage=r.msg.show({type:"error",time:3e3,text:s("pressWorksheets","FORM:ERROR:"+t)}),!0},setUpOrderSelect2:function(e){var t=this;e.removeClass("form-control"),e.select2({allowClear:!0,minimumInputLength:3,ajax:{cache:!0,quietMillis:500,url:function(e){return"/production/orders?nc12="+encodeURIComponent(e)},results:function(e){return{results:(e||[]).map(function(e){return{id:e._id,text:e._id+" - "+(e.name||"?"),data:e}})}}}}),e.on("change",function(s){var r=e.closest(".pressWorksheets-form-order"),o=t.isLastOrderRow(r);if(!s.added&&!o)return(r.next()||r.prev()).find(".pressWorksheets-form-part").select2("focus"),r.fadeOut(function(){r.remove()}),void 0;var n=s.added&&Array.isArray(s.added.data.operations)?s.added.data.operations:[],i=r.find(".pressWorksheets-form-operation");t.setUpOperationSelect2(i,n.map(function(e){return{id:e.no,text:e.no+" - "+e.name}})),n.length?i.select2("val",n[0].no).select2("focus"):(i.select2("destroy"),i.select2("destroy"),i.addClass("form-control").val(""),e.select2("focus")),o&&t.addOrderRow(r)})},setUpOperationSelect2:function(e,t){e.removeClass("form-control"),e.select2({openOnEnter:null,allowClear:!1,data:t||[]})},setUpProdLineSelect2:function(e,t){e.removeClass("form-control"),e.select2({width:"185px",openOnEnter:null,allowClear:!1,data:this.prodLinesData}),t&&e.select2("val",t.find(".pressWorksheets-form-prodLine").select2("val"))},isLastOrderRow:function(e){return this.$(".pressWorksheets-form-order:last-child")[0]===e[0]},addOrderRow:function(e){++this.lastOrderNo;var s=t(d({no:this.lastOrderNo,lossReasons:this.lossReasons,downtimeReasons:this.downtimeReasons}));this.lastOrderNo>0&&s.hide(),this.$(".pressWorksheets-form-orders > tbody").append(s),this.lastOrderNo>0&&s.fadeIn(),this.setUpOrderSelect2(s.find(".pressWorksheets-form-part")),this.setUpProdLineSelect2(s.find(".pressWorksheets-form-prodLine"),e)}})});