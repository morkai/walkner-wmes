define(["select2","app/time","app/viewport","app/core/views/FormView","app/data/orgUnits","app/orgUnits/util/setUpOrgUnitSelect2","app/wh-deliveredOrders/templates/redir"],function(e,t,i,r,a,n,s){"use strict";return r.extend({template:s,events:Object.assign({"input #-sapOrder":function(){this.loadOrder()},"change #-sourceLine":function(){this.updateSourceInfo(),this.checkLineValidity()},"change #-targetLine":function(){this.checkLineValidity()},"change #-targetPceTime":function(e){var i=t.toSeconds(e.target.value);e.target.value=i>0?t.toString(i,!0,!1):""},"click #-sourceQty":function(){this.$id("targetQty").val(+this.$id("sourceQty")[0].dataset.value||"")},"click #-sourcePceTime":function(){this.$id("targetPceTime").val(this.$id("sourcePceTime")[0].dataset.value||"")}},r.prototype.events),initialize:function(){this.orderNo=null,this.orders=[],this.req=null},handleSuccess:function(){i.closeDialog()},getFailureText:function(){return this.t("redir:error:failure")},serializeToForm:function(){return{sapOrder:this.model.get("sapOrder")||"",sourceLine:this.model.get("line")||"",targetLine:"",targetQty:""}},serializeForm:function(e){return e.pceTime=1e3*t.toSeconds(e.pceTime),e.targetQty=parseInt(e.targetQty,10),e},afterRender:function(){r.prototype.afterRender.apply(this,arguments),this.setUpSourceLineSelect2(),n(this.$id("targetLine"),{idOnly:!0,itemFilter:function(e){var t=a.getSubdivisionFor(e.model);return t&&"assembly"===t.get("type")}}),this.loadOrder()},loadOrder:function(){var e=this,t=e.$id("sapOrder").val().trim();if(t!==e.orderNo&&/^[0-9]{9}$/.test(t)){i.msg.loading(),e.orderNo=t,e.$id("sourceLine").val("").select2({width:"100%",allowClear:!0,placeholder:" ",data:[]}),e.$id("sourceQty").text("?").attr("data-value",""),e.$id("sourcePceTime").text("?").attr("data-value",""),e.$id("targetQty").val(""),e.$id("targetPceTime").val(""),e.checkLineValidity(),e.req&&e.req.abort();var r=e.ajax({url:"/old/wh/deliveredOrders?sapOrder=string:"+t});r.fail(function(){"abort"===r.statusText?i.msg.loaded():i.msg.loadingFailed()}),r.done(function(t){e.orders=t.collection||[],e.setUpSourceLineSelect2(),e.updateSourceInfo(),i.msg.loaded()}),r.always(function(){e.req=null}),e.req=r}},setUpSourceLineSelect2:function(){var t={};this.orders.forEach(function(e){t[e.line]=1});var i=[];Object.keys(t).forEach(function(e){i.push({id:e,text:e})}),t[this.model.get("line")]&&this.$id("sourceLine").val(this.model.get("line")),this.$id("sourceLine").select2({width:"100%",allowClear:!0,placeholder:" ",data:i,formatResult:function(t,i,r,a){var n=['<span class="text-mono">'];return r.term.length?e.util.markMatch(t.id,r.term,n,a):n.push(a(t.id)),n.push("</span>"),n.join("")}}),this.checkLineValidity()},updateSourceInfo:function(){var e=this.$id("sourceLine").val(),i=Number.MAX_SAFE_INTEGER,r=Number.MIN_SAFE_INTEGER,a=0,n=0;if(this.$id("noSourceMsg").toggleClass("hidden",!!e),this.orders.forEach(function(t){e&&t.line!==e||(a+=t.qtyDone,n+=t.qtyTodo,i=Math.min(i,t.pceTime),r=Math.max(r,t.pceTime))}),this.$id("sourceQty").text(a+"/"+n).attr("data-value",n-a),a&&this.$id("sourceQty").append(' <a href="javascript:void(0)"><i class="fa fa-copy"></i></a>'),i===Number.MAX_SAFE_INTEGER)this.$id("pceTime").text("?").attr("data-value","");else{i=t.toString(i/1e3,!0,!1),r=t.toString(r/1e3,!0,!1);var s=i;r!==i&&(s+=" - "+r),this.$id("sourcePceTime").text(s).attr("data-value",r).append(' <a href="javascript:void(0)"><i class="fa fa-copy"></i></a>')}},checkLineValidity:function(){var e=this.$id("sourceLine").val(),t=this.$id("targetLine").val(),i="";e&&t&&e===t&&(i=this.t("redir:error:sameLines")),this.$id("targetLine")[0].setCustomValidity(i)},request:function(e){return this.promised(this.ajax({method:"POST",url:"/old/wh/deliveredOrders;redir",data:JSON.stringify(e)}))}})});