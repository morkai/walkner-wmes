define(["underscore","js2form","app/viewport","app/user","app/core/View","app/core/templates/colorPicker","../SettingChangeCollection","./ChangesView","bootstrap-colorpicker"],function(t,e,i,a,r,n,s,o){"use strict";return r.extend({clientUrl:"#settings",defaultTab:null,shouldAutoUpdateSettingField:function(t){return!0},updateSettingField:function(t){},events:{"click a[data-tab]":function(t){var e=t.currentTarget,i=e.dataset.tab,a=e.dataset.subtab||"";return e.dataset.redirect?window.location.href=e.dataset.redirect:e.classList.contains("disabled")||(this.broker.publish("router.navigate",{url:this.clientUrl+"?tab="+i+"&subtab="+a,trigger:!1,replace:!0}),this.changeTab(i,a)),!1},"change .colorpicker-component > .form-control":function(t){t.originalEvent&&this.$(t.target).closest(".colorpicker-component").colorpicker("setValue",t.target.value)},"keyup .form-control":function(t){var e=t.target,i=e.dataset.value;e.dataset.value=e.value,e.value!==i&&this.scheduleUpdateSetting(e,parseInt(e.dataset.keyupDelay,10)||1200)},'change .form-control, input[type="checkbox"], input[type="radio"]':function(t){var e=parseInt(t.target.dataset.changeDelay,10);(isNaN(e)||e<0)&&(e=300),this.scheduleUpdateSetting(t.target,e)},"click label":function(t){if(t.ctrlKey&&a.isAllowedTo("SUPER")){var e=t.currentTarget.dataset.setting||t.currentTarget.control&&t.currentTarget.control.name;return e?(this.showSettingChanges(e),!1):void 0}}},initialize:function(){this.currentTab=this.options.initialTab,this.currentSubtab=this.options.initialSubtab,this.inProgress={},this.model=this.settings,this.listenTo(this.settings,"add change",this.onSettingsChange)},destroy:function(){var t=this.$(".colorpicker-component");t.length&&t.colorpicker("destroy")},serialize:function(){return Object.assign(r.prototype.serialize.call(this),{renderColorPicker:n})},afterRender:function(){this.toggleTabPrivileges(),this.$(".colorpicker-component").colorpicker(),e(this.el,this.serializeFormData()),this.$("[name]").each(function(){this.dataset.value=this.value}),this.changeTab(this.currentTab||this.defaultTab||this.$(".list-group-item[data-tab]").attr("data-tab"),this.currentSubtab)},toggleTabPrivileges:function(){},serializeFormData:function(){var t={},e=this;return this.settings.forEach(function(i){var a=e.settings.prepareFormValue(i.id,i.get("value"));if(Array.isArray(a)){var r=e.el.querySelector('input[name="'+i.id+'"]')||e.el.querySelector('input[name="'+i.id+'[]"]');(!r||"SELECT"!==r.tagName&&"checkbox"!==r.type)&&(a=String(a))}else a=String(a);t[i.id]=a}),t},changeTab:function(e,i){var a=this.$(".list-group-item.active"),r=this.$('.list-group-item[data-tab="'+e+'"]').first();if(r.hasClass("disabled")){if(a.length)return;this.$(".list-group-item").filter(":not(.disabled)").first().click()}else{a.removeClass("active"),r.addClass("active"),this.$(".panel-body.active").removeClass("active");var n=this.$('.panel-body[data-tab="'+e+'"]').addClass("active");if(n.hasClass("has-subtabs")){if(t.isEmpty(i)&&(i=n.find(".list-group-item").first().attr("data-subtab")),a=n.find(".list-group-item.active"),(r=n.find('.list-group-item[data-subtab="'+i+'"]')).hasClass("disabled")){if(a.length)return;return void n.find(".list-group-item").filter(":not(.disabled)").first().click()}a.removeClass("active"),r.addClass("active"),n.find(".panel-body.active").removeClass("active"),n.find('.panel-body[data-subtab="'+i+'"]').addClass("active")}this.currentTab=e,this.currentSubtab=i}},onSettingsChange:function(t){if(t&&!this.inProgress[t.id])if(this.shouldAutoUpdateSettingField(t)){var e=this.$('.form-control[name="'+t.id+'"]'),i=this.settings.prepareFormValue(t.id,t.get("value"));e.length&&e.val(i);var a=e.parent();if(a.hasClass("colorpicker-component")&&a.colorpicker("setValue",i),!e.length){var r=this.$('input[name="'+t.id+'"]');if(r.length){if("checkbox"===r[0].type)return void this.updateCheckboxSetting(t,r);if("radio"===r[0].type)return void this.updateRadioSetting(t,r);var n=r.first().prev();n.hasClass("select2-container")&&(n.hasClass("select2-container-multi")&&!Array.isArray(i)&&(i=i.split(",")),n.select2("val",i))}this.updateSettingField(t)}}else this.updateSettingField(t)},updateCheckboxSetting:function(t,e){var i=t.get("value");if(1===e.length)e[0].checked=!!i;else{Array.isArray(i)||(i=i?"string"==typeof i?i.split(","):[i]:[]);for(var a=0;a<e.length;++a){var r=e[a];r.checked=-1!==i.indexOf(r.value)}}},updateRadioSetting:function(t,e){e.filter('[value="'+t.get("value")+'"]').prop("checked",!0)},getValueFromSettingField:function(t){return"checkbox"===t.type?this.getValueFromCheckboxSetting(t):"radio"===t.type?this.getValueFromRadioSetting(t):t.value},getValueFromCheckboxSetting:function(t){var e=this.$('input[name="'+t.name+'"]');if(0===e.length)return null;if(1===e.length)return this.getCheckboxValue(e[0]);for(var i=[],a=0;a<e.length;++a){var r=this.getCheckboxValue(e[a]);r&&i.push(r)}return i},getCheckboxValue:function(t){return"true"===t.value?t.checked:"1"===t.value?t.checked?1:0:t.checked?t.value:null},getValueFromRadioSetting:function(t){return this.$('input[name="'+t.name+'"]:checked').val()},scheduleUpdateSetting:function(e,i){var a=e.name.replace("[]","");if(!t.isEmpty(a)){var r=this.getValueFromSettingField(e);if(this.timers[a]&&clearTimeout(this.timers[a]),0===i)return delete this.timers[a],void this.updateSetting(a,r);this.timers[a]=setTimeout(this.updateSetting.bind(this,a,r),i)}},updateSetting:function(t,e){var a=this;return clearTimeout(a.timers[t]),a.inProgress[t]||(a.inProgress[t]=0),++a.inProgress[t],i.msg.saving(),a.settings.update(t,e).always(function(){--a.inProgress[t],i.msg.saved()})},showSettingChanges:function(t){t=t.replace("[]","");var e=new o({collection:new s(null,{rqlQuery:"limit(20)&sort(-time)&setting="+encodeURIComponent(t)})});i.showDialog(e,t)}})});