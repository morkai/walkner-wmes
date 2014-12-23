// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["js2form","app/core/View","app/data/orgUnits","app/core/templates/colorPicker","app/factoryLayout/templates/settings","bootstrap-colorpicker"],function(t,e,i,s,a){return e.extend({template:a,localTopics:{"divisions.synced":"render","subdivisions.synced":"render"},events:{"click a[data-tab]":function(t){var e=t.target.dataset.tab;return this.broker.publish("router.navigate",{url:"#factoryLayout;settings?tab="+e,trigger:!1,replace:!0}),this.changeTab(e),!1},"change .colorpicker-component > .form-control":function(t){t.originalEvent&&this.$(t.target).closest(".colorpicker-component").colorpicker("setValue",t.target.value)},"keyup .form-control":function(t){var e=t.target,i=e.dataset.value;e.dataset.value=e.value,e.value!==i&&this.scheduleUpdateSetting(e,1200)},"change .form-control":function(t){this.scheduleUpdateSetting(t.target,300)},'change input[name^="factoryLayout.blacklist"]':function(t){this.updateSetting(t.target.name,t.target.value)}},initialize:function(){this.currentTab=this.options.initialTab,this.inProgress={},this.listenTo(this.settings,"add change",this.onSettingsChange)},destroy:function(){this.$(".colorpicker-component").colorpicker("destroy")},serialize:function(){var t=this.settings;return{idPrefix:this.idPrefix,renderColorPicker:s,divisions:i.getAllByType("division").map(function(e){var i="factoryLayout."+e.id+".color",s=t.get(i);return{property:i,label:e.getLabel(),color:s?s.get("value"):"#FFFFFF"}})}},afterRender:function(){this.$(".colorpicker-component").colorpicker();var e={};this.settings.forEach(function(t){e[t.id]=String(t.get("value"))}),t(this.el,e),this.$("[name]").each(function(){this.dataset.value=this.value}),this.setUpBlacklistSelect2("division"),this.setUpBlacklistSelect2("subdivision"),this.setUpBlacklistSelect2("mrpController"),this.setUpBlacklistSelect2("prodFlow"),this.setUpBlacklistSelect2("workCenter"),this.setUpBlacklistSelect2("prodLine"),this.changeTab(this.currentTab||"blacklist")},setUpBlacklistSelect2:function(t){var e=this.$id("blacklist-"+t);e.select2({multiple:!0,data:i.getAllByType(t).map(function(e){return{id:e.id,text:("subdivision"===t?e.get("division")+" > ":"")+e.getLabel()}})})},changeTab:function(t){this.$(".list-group-item.active").removeClass("active"),this.$(".list-group-item[data-tab="+t+"]").addClass("active"),this.$(".panel-body.active").removeClass("active"),this.$(".panel-body[data-tab="+t+"]").addClass("active"),this.currentTab=t},onSettingsChange:function(t){if(t&&!this.inProgress[t.id]){if(/blacklist/.test(t.id))return this.$('input[name="'+t.id+'"]').select2("val",t.getValue());var e=this.$('.form-control[name="'+t.id+'"]');e.val(t.get("value")||"");var i=e.parent();i.hasClass("colorpicker-component")&&i.colorpicker("setValue",t.get("value"))}},scheduleUpdateSetting:function(t,e){var i=t.name,s=t.value;this.timers[i]&&clearTimeout(this.timers[i]),this.timers[i]=setTimeout(this.updateSetting.bind(this,i,s),e)},updateSetting:function(t,e){clearTimeout(this.timers[t]),this.inProgress[t]||(this.inProgress[t]=0),++this.inProgress[t];var i=this;this.promised(this.settings.update(t,e)).always(function(){--i.inProgress[t],i.onSettingsChange(i.settings.get(t))})}})});