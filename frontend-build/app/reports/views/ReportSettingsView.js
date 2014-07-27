// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["js2form","app/core/View","app/data/orgUnits","app/core/templates/colorPicker","app/reports/templates/settings","bootstrap-colorpicker"],function(e,t,i,r,n){return t.extend({template:n,localTopics:{"divisions.synced":"render","subdivisions.synced":"render"},events:{"click a[data-tab]":function(e){var t=e.target.dataset.tab;return this.broker.publish("router.navigate",{url:"#reports;settings?tab="+t,trigger:!1,replace:!0}),this.changeTab(t),!1},"change .colorpicker-component > .form-control":function(e){e.originalEvent&&this.$(e.target).closest(".colorpicker-component").colorpicker("setValue",e.target.value)},"keyup .form-control":function(e){var t=e.target,i=t.dataset.value;t.dataset.value=t.value,t.value!==i&&this.scheduleUpdateSetting(t,1200)},"change .form-control":function(e){this.scheduleUpdateSetting(e.target,300)},"change #-absenceRef-prodTask":function(e){this.updateSetting(e.target.name,e.target.value)}},initialize:function(){this.currentTab=this.options.initialTab,this.inProgress={},this.listenTo(this.settings,"add change",this.onSettingsChange)},destroy:function(){this.$(".colorpicker-component").colorpicker("destroy")},serialize:function(){return{idPrefix:this.idPrefix,renderColorPicker:r,divisions:i.getAllDivisions().filter(function(e){return"prod"===e.get("type")}).map(function(e){return{_id:e.id,label:e.getLabel(),subdivisions:i.getChildren(e).map(function(e){return{_id:e.id,label:e.getLabel()}}).sort(function(e,t){return e.label.localeCompare(t.label)})}}).sort(function(e,t){return e.label.localeCompare(t.label)}),colors:this.serializeColors()}},serializeColors:function(){var e={};return["quantityDone","efficiency","productivity","productivityNoWh","scheduledDowntime","unscheduledDowntime","clipOrderCount","clipProduction","clipEndToEnd","direct","directRef","indirect","indirectRef","warehouse","warehouseRef","absence","absenceRef","dirIndir","dirIndirRef","eff","ineff"].forEach(function(t){e[t]=this.settings.getColor(t)},this),e},afterRender:function(){this.$(".colorpicker-component").colorpicker();var t={};this.settings.forEach(function(e){t[e.id]=e.get("value")}),e(this.el,t),this.$("[name]").each(function(){this.dataset.value=this.value}),this.$id("absenceRef-prodTask").select2({width:"374px",allowClear:!0,placeholder:" ",data:this.prodTasks.map(function(e){return{id:e.id,text:e.get("name")}})}),this.changeTab(this.currentTab||"efficiency")},changeTab:function(e){this.$(".list-group-item.active").removeClass("active"),this.$(".list-group-item[data-tab="+e+"]").addClass("active"),this.$(".panel-body.active").removeClass("active"),this.$(".panel-body[data-tab="+e+"]").addClass("active"),this.currentTab=e},onSettingsChange:function(e){if(e&&!this.inProgress[e.id]){if("reports.absenceRef.prodTask"===e.id)return this.$id("absenceRef-prodTask").select2("val",e.getValue());var t=this.$('.form-control[name="'+e.id+'"]');t.val(e.get("value")||"");var i=t.parent();i.hasClass("colorpicker-component")&&i.colorpicker("setValue",e.get("value"))}},scheduleUpdateSetting:function(e,t){var i=e.name,r=e.value;this.timers[i]&&clearTimeout(this.timers[i]),this.timers[i]=setTimeout(this.updateSetting.bind(this,i,r),t)},updateSetting:function(e,t){clearTimeout(this.timers[e]),this.inProgress[e]||(this.inProgress[e]=0),++this.inProgress[e];var i=this;this.promised(this.settings.update(e,t)).always(function(){--i.inProgress[e],i.onSettingsChange(i.settings.get(e))})}})});