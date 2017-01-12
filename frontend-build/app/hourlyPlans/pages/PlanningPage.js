// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/viewport","app/core/View","app/core/util/bindLoadingMessage","../views/DailyMrpPlanFilterView","../views/DailyMrpPlanView","../views/DailyMrpPlanImportView","app/hourlyPlans/templates/dailyMrpPlans/page"],function(e,t,i,n,s,r,a,o,l,d,h){"use strict";return r.extend({layoutName:"page",template:h,actions:null,breadcrumbs:[{href:"#hourlyPlans",label:i.bound("hourlyPlans","BREADCRUMBS:browse")},i.bound("hourlyPlans","BREADCRUMBS:planning")],events:{},initialize:function(){var i=this.idPrefix,n=this.handleDragEvent.bind(this);this.model=a(this.model.subscribe(this.pubsub),this),this.filterView=new o({model:this.model}),this.setView("#"+i+"-filter",this.filterView),this.listenTo(this.model,"import",this.onImport),this.listenTo(this.model,"reset",e.after(1,this.onReset)),this.listenTo(this.model.options,"change:wrap",this.onWrapChange),t("body").on("paste."+i,this.onBodyPaste.bind(this)).on("keydown."+i,this.onBodyKeyDown.bind(this)),t(document).on("dragstart."+i,n).on("dragenter."+i,n).on("dragleave."+i,n).on("dragover."+i,n).on("drop."+i,this.onDrop.bind(this))},destroy:function(){t("body").off("."+this.idPrefix).css("overflow-x",""),t(document).off("."+this.idPrefix)},load:function(e){return this.model.hasRequiredFilters()?e(this.model.fetch({reset:!0})):e()},serialize:function(){return{idPrefix:this.idPrefix,wrap:!!this.model.options.get("wrap")}},beforeRender:function(){var e=t("head");e.find('link[href$="planning.css"]').length||e.append('<link rel="stylesheet" href="/app/hourlyPlans/assets/planning.css">')},afterRender:function(){t("body").css("overflow-x","hidden"),this.renderPlans(),this.toggleMessages()},toggleMessages:function(){var e=this.model.hasRequiredFilters();this.$id("msg-filter").toggleClass("hidden",e),this.$id("msg-empty").toggleClass("hidden",this.model.length>0)},renderPlans:function(){var e=this,t="#"+e.idPrefix+"-plans";e.removeView(t),e.model.forEach(function(i){var n=new l({model:i});e.insertView(t,n),n.render()})},onImport:function(e){this.model.rqlQuery.selector.args=[{name:"eq",args:["date",e.date]},{name:"in",args:["mrp",e.mrps]}],this.filterView.render()},onReset:function(){this.updateClientUrl(),this.renderPlans(),this.toggleMessages()},onWrapChange:function(){this.$el.toggleClass("wrap",!!this.model.options.get("wrap"))},updateClientUrl:function(){this.broker.publish("router.navigate",{url:"/hourlyPlans;planning?"+this.model.rqlQuery,trigger:!1,replace:!0})},handleDragEvent:function(e){return"dragstart"===e.type?void(this.sortableDragged=e.target.classList.contains("select2-search-choice")):(e.preventDefault(),void e.stopPropagation())},onDrop:function(t){if(this.sortableDragged)return void(this.sortableDragged=!1);if(t=t.originalEvent,t.preventDefault(),t.stopPropagation(),!t.dataTransfer.files.length)return s.msg.show({type:"warning",time:3e3,text:i("hourlyPlans","planning:msg:filesOnly")});var n=e.find(t.dataTransfer.files,function(e){return/vnd.ms-excel.sheet|spreadsheetml.sheet/.test(e.type)&&/\.xls(x|m)$/.test(e.name)});if(!n)return s.msg.show({type:"warning",time:3e3,text:i("hourlyPlans","planning:msg:invalidFile")});s.msg.loading();var r=new FormData;r.append("plan",n);var a=this,o=a.ajax({type:"POST",url:"/dailyMrpPlans;parse",data:r,processData:!1,contentType:!1});o.fail(function(){s.msg.loadingFailed()}),o.done(function(e){s.msg.loaded(),a.showImportDialog(e)})},onBodyKeyDown:function(e){if(27===e.keyCode)this.$(".is-selected").click();else if(13===e.keyCode){var t=this.$(".dailyMrpPlan-popover-editable");t.length&&this.saveChanges(t)}},onBodyPaste:function(e){if("INPUT"!==e.target.tagName){var t=e.originalEvent.clipboardData.getData("text/plain")||"",i=this.parseInput(t);this.showImportDialog(i)}},parseInput:function(e){var t={__DATE__:this.filterView.$id("date").val()||null},i=null,s=["_id","nc12","name","qty","rbh","operators","shifts"],r=null;e.split("\n").forEach(function(e){if(!r){var n=e.match(/([0-9]{1,2}[^0-9][0-9]{1,2}[^0-9][0-9]{4})/);if(n)return void(r=n[1])}if(e=" "+e+" ",/\s+[0-9]{9}\s+/.test(e)){var a={},o=0;return e.trim().split("	").forEach(function(e){if(o!==s.length){if(e=e.trim(),0===o)return void(/^[0-9]{9}$/.test(e)&&(a._id=e,o+=1));/^[0-9](,[0-9]+)?$/.test(e)&&(e=parseFloat(e.replace(",","."))),a[s[o]]=e,o+=1}}),t[i]||(t[i]=[]),void t[i].push(a)}var l=e.match(/\s+([A-Z][A-Z0-9]{2})\s+/);return l?(i=l[1],void(t[i]||(t[i]=[]))):void 0});var a=n.getMoment(r,"DD.MM.YYYY");return a.isValid()&&(t.__DATE__=a.format("YYYY-MM-DD")),t},showImportDialog:function(t){if(!s.currentDialog){var n=t.__DATE__;if(delete t.__DATE__,!e.isEmpty(t)){var r=new d({model:{dailyMrpPlans:this.model,date:n,mrpToOrdersMap:t}});this.listenToOnce(r,"imported",function(){s.closeDialog()}),s.showDialog(r,i("hourlyPlans","planning:import:title"))}}},saveChanges:function(e){var t=this.model.get(e.attr("data-plan"));if(t){var i=e.attr("data-item-type");"order"===i?t.orders.trigger("saveChangesRequested"):"line"===i&&t.lines.trigger("saveChangesRequested")}}})});