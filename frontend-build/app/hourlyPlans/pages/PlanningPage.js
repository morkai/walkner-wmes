// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/viewport","app/core/View","app/core/util/bindLoadingMessage","../util/autoDowntimeCache","../settings","../DailyMrpPlanLine","../views/DailyMrpPlanFilterView","../views/DailyMrpPlanView","../views/DailyMrpPlanImportView","app/hourlyPlans/templates/dailyMrpPlans/page"],function(e,t,i,n,r,o,a,s,l,d,p,m,g,f){"use strict";return o.extend({layoutName:"page",template:f,breadcrumbs:function(){var e=[{href:"#dailyMrpPlans;list",label:i.bound("hourlyPlans","BREADCRUMBS:dailyMrpPlans")},n.getMoment(this.model.getCurrentFilter().date,"YYYY-MM-DD").format("L")];return e},actions:function(){return[{label:i.bound("hourlyPlans","PAGE_ACTION:settings"),icon:"cogs",privileges:"PROD_DATA:MANAGE",href:"#hourlyPlans;settings?tab="}]},events:{"click .dailyMrpPlan-message-mrp":function(e){var t=e.currentTarget.textContent,i=this.model.find(function(e){return e.mrp.id===t});i&&i.trigger("scrollIntoView")}},initialize:function(){var i=this,n=i.model,r=i.idPrefix,o=i.handleDragEvent.bind(i);i.model=a(n.subscribe(i.pubsub),i),i.filterView=new p({model:n}),i.setView("#"+r+"-filter",i.filterView),i.listenTo(n,"import",i.onImport),i.listenTo(n,"reset",e.after(2,i.onReset)),i.listenTo(n,"sync",i.onSync),i.listenTo(this.model,"checkOverlappingLinesRequested",e.debounce(i.checkOverlappingLines,50)),i.listenTo(n.options,"change:wrap",i.onWrapChange),i.listenTo(n.settings,"change",i.onSettingsChange),t("body").on("paste."+r,i.onBodyPaste.bind(i)).on("keydown."+r,i.onBodyKeyDown.bind(i)),t(document).on("dragstart."+r,o).on("dragenter."+r,o).on("dragleave."+r,o).on("dragover."+r,o).on("drop."+r,i.onDrop.bind(i))},destroy:function(){t("body").off("."+this.idPrefix).css("overflow-x",""),t(document).off("."+this.idPrefix),l.release()},load:function(e){return this.readCurrentFilterIfNeeded(),this.model.hasRequiredFilters()?e(this.loadStyles(),this.model.settings.fetchIfEmpty(),this.model.fetch({reset:!0})):e(this.loadStyles(),this.model.settings.fetchIfEmpty())},setUpLayout:function(e){this.layout=e},serialize:function(){return{idPrefix:this.idPrefix,wrap:!!this.model.options.get("wrap")}},loadStyles:function(){var e=t.Deferred(),i=t("head");return i.find('link[href$="planning.css"]').length?e.resolve():t('<link rel="stylesheet" href="/app/hourlyPlans/assets/planning.css">').on("load",function(){e.resolve()}).appendTo(i),e.promise()},afterRender:function(){l.acquire(),t("body").css("overflow-x","hidden"),this.renderPlans(),this.toggleMessages(),this.checkOverlappingLines()},toggleMessages:function(){var e=this.model.hasRequiredFilters();this.$id("msg-filter").toggleClass("hidden",e),this.$id("msg-empty").toggleClass("hidden",this.model.length>0)},renderPlans:function(){var e=this,t="#"+e.idPrefix+"-plans";e.removeView(t),e.model.forEach(function(i){var n=new m({model:i});e.insertView(t,n),n.render()})},onImport:function(e){this.model.setCurrentFilter(e),this.storeCurrentFilter(),this.filterView.render()},onReset:function(){this.storeCurrentFilter(),this.updateClientUrl(),this.renderPlans(),this.toggleMessages()},onSync:function(){this.layout&&this.layout.setBreadcrumbs(this.breadcrumbs,this)},storeCurrentFilter:function(){localStorage.setItem("PLANNING:FILTER",JSON.stringify(this.model.getCurrentFilter()))},readCurrentFilterIfNeeded:function(){var t=JSON.parse(localStorage.getItem("PLANNING:FILTER")||"{}"),i=this.model.getCurrentFilter(),n=!1;!i.date&&t.date&&(i.date=t.date,n=!0),e.isEmpty(i.mrp)&&!e.isEmpty(t.mrp)&&(i.mrp=t.mrp,n=!0),n&&this.model.setCurrentFilter(i)},onWrapChange:function(){this.$el.toggleClass("wrap",!!this.model.options.get("wrap"))},onSettingsChange:function(e){"production.lineAutoDowntimes"===e.id&&s.clear()},updateClientUrl:function(){this.broker.publish("router.navigate",{url:"/dailyMrpPlans?"+this.model.rqlQuery,trigger:!1,replace:!0})},handleDragEvent:function(e){return"dragstart"===e.type?void(this.sortableDragged=e.target.classList.contains("select2-search-choice")):(e.preventDefault(),void e.stopPropagation())},onDrop:function(t){if(this.sortableDragged)return void(this.sortableDragged=!1);if(t=t.originalEvent,t.preventDefault(),t.stopPropagation(),!t.dataTransfer.files.length)return r.msg.show({type:"warning",time:3e3,text:i("hourlyPlans","planning:msg:filesOnly")});var n=e.find(t.dataTransfer.files,function(e){return/vnd.ms-excel.sheet|spreadsheetml.sheet/.test(e.type)&&/\.xls(x|m)$/.test(e.name)});if(!n)return r.msg.show({type:"warning",time:3e3,text:i("hourlyPlans","planning:msg:invalidFile")});r.msg.loading();var o=new FormData;o.append("plan",n);var a=this,s=a.ajax({type:"POST",url:"/dailyMrpPlans;parse",data:o,processData:!1,contentType:!1});s.fail(function(){r.msg.loadingFailed()}),s.done(function(e){r.msg.loaded(),a.showImportDialog(e)})},onBodyKeyDown:function(e){if(27===e.keyCode)this.$(".is-selected").click();else if(13===e.keyCode){var t=this.$(".dailyMrpPlan-popover-editable");t.length&&this.saveChanges(t)}},onBodyPaste:function(e){if("INPUT"!==e.target.tagName){var t=e.originalEvent.clipboardData.getData("text/plain")||"",i=this.parseInput(t);this.showImportDialog(i)}},parseInput:function(e){var t={__DATE__:this.filterView.$id("date").val()||null},i=null,r=["_id","nc12","name","qty","rbh","operators","shifts"],o=null;e.split("\n").forEach(function(e){if(!o){var n=e.match(/([0-9]{1,2}[^0-9][0-9]{1,2}[^0-9][0-9]{4})/);if(n)return void(o=n[1])}if(e=" "+e+" ",/\s+[0-9]{9}\s+/.test(e)){var a={},s=0;return e.trim().split("\t").forEach(function(e){if(s!==r.length){if(e=e.trim(),0===s)return void(/^[0-9]{9}$/.test(e)&&(a._id=e,s+=1));/^[0-9]+(,[0-9]+)?$/.test(e)&&(e=parseFloat(e.replace(",","."))),a[r[s]]=e,s+=1}}),t[i]||(t[i]=[]),void t[i].push(a)}var l=e.match(/\s+([A-Z][A-Z0-9]{2})\s+/);if(l)return i=l[1],void(t[i]||(t[i]=[]))});var a=n.getMoment(o,"DD.MM.YYYY");return a.isValid()&&(t.__DATE__=a.format("YYYY-MM-DD")),t},showImportDialog:function(t){if(!r.currentDialog){var n=t.__DATE__;if(delete t.__DATE__,!e.isEmpty(t)){var o=new g({model:{dailyMrpPlans:this.model,date:n,mrpToOrdersMap:t}});this.listenToOnce(o,"imported",function(){r.closeDialog()}),r.showDialog(o,i("hourlyPlans","planning:import:title"))}}},saveChanges:function(e){var t=this.model.get(e.attr("data-plan"));if(t){var i=e.attr("data-item-type");"order"===i?t.orders.trigger("saveChangesRequested"):"line"===i&&t.lines.trigger("saveChangesRequested")}},checkOverlappingLines:function(){var t=this;if(this.model.length){var i=t.model.at(0).date.getTime(),n="/dailyMrpPlans?select(lines._id,lines.activeFrom,lines.activeTo)&date="+i;t.ajax({url:n}).done(function(n){t.model.trigger("checkingOverlappingLines");var r={},o={};e.forEach(n.collection,function(t){e.isEmpty(t.lines)||(r[t._id]={},t.lines.forEach(function(e){o[e._id]||(o[e._id]=[]),o[e._id].push(t._id),r[t._id][e._id]={activeFrom:d.getActiveFromMoment(i,e.activeFrom).toDate(),activeTo:d.getActiveToMoment(i,e.activeTo).toDate()}}))}),e.forEach(o,function(e,i){1!==e.length&&t.checkLineOverlapping(i,e.map(function(e){return{line:i,plan:e,from:r[e][i].activeFrom,to:r[e][i].activeTo}}))})})}},checkLineOverlapping:function(e,t){for(var i=0;i<t.length;++i)for(var r=t[i],o=i+1;o<t.length;++o){var a=t[o];if(!(r.from>=a.to||r.to<=a.from)){var s=this.model.get(r.plan);s&&s.trigger("overlappingLine",{line:e,plan:a.plan,mrp:a.plan.split("-")[1],from1:n.format(r.from,"HH:mm"),from2:n.format(a.from,"HH:mm"),to1:n.format(r.to,"HH:mm"),to2:n.format(a.to,"HH:mm")});var l=this.model.get(a.plan);l&&l.trigger("overlappingLine",{line:e,plan:r.plan,mrp:r.plan.split("-")[1],from1:n.format(a.from,"HH:mm"),from2:n.format(r.from,"HH:mm"),to1:n.format(a.to,"HH:mm"),to2:n.format(r.to,"HH:mm")})}}}})});