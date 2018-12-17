define(["underscore","app/data/prodFunctions","app/core/util/idAndLabel","app/settings/views/SettingsView","app/wmes-fap-entries/templates/settings"],function(t,e,n,i,s){"use strict";return i.extend({clientUrl:"#fap/settings",template:s,events:t.assign({"change input[data-setting]":function(t){this.updateSetting(t.target.name,t.target.value)}},i.prototype.events),afterRender:function(){i.prototype.afterRender.apply(this,arguments),this.setUpPendingFunctions()},setUpPendingFunctions:function(){this.$id("pendingFunctions").select2({width:"100%",allowClear:!0,multiple:!0,data:e.map(n)}),this.updateSettingField(this.settings.get("fap.pendingFunctions"))},shouldAutoUpdateSettingField:function(t){return!/pendingFunctions$/i.test(t.id)},updateSettingField:function(t){if(t&&/pendingFunctions$/i.test(t.id)){var n=t.getValue().map(function(t){var n=e.get(t);return{id:t,text:n?n.getLabel():t}});this.$id("pendingFunctions").select2("data",n)}}})});