define(["underscore","jquery","Sortable","app/i18n","app/viewport","app/core/View","app/core/util/idAndLabel","app/mrpControllers/util/setUpMrpSelect2","app/planning/templates/lineSettingsDialog"],function(t,i,e,r,s,o,n,a,l){"use strict";return o.extend({modelProperty:"plan",template:l,events:{submit:function(){return this.submitForm(),!1},"change #-orderGroupPriority":function(){s.adjustDialogBackdrop()},"change #-activeTime":function(){const t=this.$id("activeTime"),i=t.val().trim().split(/[\s,]+/).map(t=>{const i=t.trim().split("-"),e=i[0].split(":"),r=(i[1]||"0").split(":");return`${(parseInt(e[0],10)||0).toString().padStart(2,"0")}:${(parseInt(e[1],10)||0).toString().padStart(2,"0")}-${(parseInt(r[0],10)||0).toString().padStart(2,"0")}:${(parseInt(r[1],10)||0).toString().padStart(2,"0")}`}).filter(t=>"00:00-00:00"!==t&&"06:00-06:00"!==t).join(", ");t.val(i)}},initialize:function(){this.sortables=[],this.listenTo(this.plan.settings,"changed",this.onSettingsChanged)},destroy:function(){this.destroySortables()},destroySortables:function(){t.invoke(this.sortables,"destroy"),this.sortables=[]},getTemplateData:function(){const t=this.plan.settings.getVersion(),i=this.line.settings,e=this.line.mrpSettings(this.mrp.id);return{version:t,mrp:this.mrp.getLabel(),line:this.line.getLabel(),mrpPriority:i.get("mrpPriority").join(","),orderGroupPriority:(i.get("orderGroupPriority")||[]).join(","),activeTime:i.get("activeTime").map(t=>`${t.from}-${t.to}`).join(", "),workerCount:(1===t?e:i).get("workerCount"),orderPriority:(1===t?e:i).get("orderPriority").join(","),extraCapacity:i.get("extraCapacity")||"0"}},afterRender:function(){this.setUpMrpPriority(),this.setUpOrderGroupPriority(),this.setUpOrderPriority()},setUpMrpPriority:function(){a(this.$id("mrpPriority"),{view:this,sortable:!0,width:"100%",placeholder:this.t("settings:mrpPriority:placeholder"),itemDecorator:t=>(t.disabled=this.plan.settings.isMrpLocked(t.id),t.locked=t.disabled,t.locked&&(t.icon={id:"fa-lock",color:"#e00"}),t)})},setUpOrderGroupPriority:function(){var t=this.$id("orderGroupPriority");t.length&&(t.select2({allowClear:!0,multiple:!0,data:this.orderGroups.map(n)}),this.sortables.push(new e(t.select2("container").find(".select2-choices")[0],{draggable:".select2-search-choice",filter:".select2-search-choice-close",onStart:()=>{t.select2("onSortStart")},onEnd:()=>{t.select2("onSortEnd").select2("focus")}})))},setUpOrderPriority:function(){var t=this.$id("orderPriority").select2({allowClear:!0,multiple:!0,data:this.plan.settings.getAvailableOrderPriorities().map(t=>({id:t,text:this.t(`orderPriority:${t}`)}))});this.sortables.push(new e(t.select2("container").find(".select2-choices")[0],{draggable:".select2-search-choice",filter:".select2-search-choice-close",onStart:()=>{t.select2("onSortStart")},onEnd:()=>{t.select2("onSortEnd").select2("focus")}}))},submitForm:function(){const t=this.$id("submit").prop("disabled",!0),i=t.find(".fa-spinner").removeClass("hidden"),e=this.plan.settings,r=this.line.settings,o=e.getVersion(),n=this.$id("mrpPriority").val().split(","),a=this.$id("orderPriority").val().split(","),l=[1,2,3].map(t=>Math.max(0,+this.$id(`workerCount${t}`).val()||0));let p=this.$id("extraCapacity").val().trim();p&&"0"!==p&&"0%"!==p||(p="0"),r.set({mrpPriority:n,orderGroupPriority:(this.$id("orderGroupPriority").val()||"").split(",").filter(t=>!!t),activeTime:this.$id("activeTime").val().split(",").map(t=>{const i=t.trim().split("-");return{from:i[0],to:i[1]}}).filter(t=>!!t.to),extraCapacity:p}),o>1&&r.set({workerCount:l,orderPriority:a});const d=!!this.$id("applyToAllMrps").prop("checked");n.forEach(t=>{let i=e.mrps.get(t);i||(i=e.mrps.add({_id:t}).get(t));let r=i.lines.get(this.line.id);r||(r=i.lines.add({_id:this.line.id}).get(this.line.id)),(d||r.id===this.line.id)&&r.set({workerCount:1===o?l:[0,0,0],orderPriority:1===o?a:[]})}),s.msg.saving();const c=this.plan.settings.save();c.done(()=>{s.msg.saved(),s.closeDialog()}),c.fail(()=>{i.addClass("hidden"),t.prop("disabled",!1),s.msg.savingFailed(),this.plan.settings.trigger("errored")})},onDialogShown:function(){this.$id("mrpPriority").select2("focus")},onSettingsChanged:function(i){if(i.locked){var e=this,r=e.$id("mrpPriority"),s=e.line.settings.get("mrpPriority"),o=r.val().split(",").filter(function(i){return i.length>0&&(t.includes(s,i)||!e.plan.settings.isMrpLocked(i))});r.select("destroy").val(o.join(",")),this.setUpMrpPriority()}}})});