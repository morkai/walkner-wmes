define(["underscore","app/data/prodFunctions","app/core/util/idAndLabel","app/settings/views/SettingsView","app/users/util/setUpUserSelect2","app/wmes-fap-entries/templates/settings"],function(t,e,i,n,s,a){"use strict";return n.extend({clientUrl:"#fap/settings",template:a,events:t.assign({"change input[data-setting]":function(t){this.updateSetting(t.target.name,this.getValueFromSettingField(t.target))}},n.prototype.events),afterRender:function(){n.prototype.afterRender.apply(this,arguments),this.setUpPendingFunctions()},setUpPendingFunctions:function(){this.$id("pendingFunctions").select2({width:"100%",allowClear:!0,multiple:!0,data:e.map(i)}),this.$id("categoryFunctions").select2({width:"100%",allowClear:!0,multiple:!0,data:e.map(i)}),s(this.$id("quickUsers"),{view:this,multiple:!0}),this.updateSettingField(this.settings.get("fap.pendingFunctions")),this.updateSettingField(this.settings.get("fap.categoryFunctions"))},shouldAutoUpdateSettingField:function(t){return!/(Functions|quickUsers)$/i.test(t.id)},updateSettingField:function(t){t&&(/Functions$/i.test(t.id)&&this.$id(t.id.split(".")[1]).select2("data",(t.getValue()||[]).map(function(t){var i=e.get(t);return{id:t,text:i?i.getLabel():t}})),/quickUsers$/.test(t.id)&&this.$id("quickUsers").select2("data",(t.getValue()||[]).map(function(t){return{id:t.id,text:t.label}})))},getValueFromSettingField:function(t){return/quickUsers$/.test(t.name)?s.getUserInfo(this.$id("quickUsers")):n.prototype.getValueFromSettingField.apply(this,arguments)}})});