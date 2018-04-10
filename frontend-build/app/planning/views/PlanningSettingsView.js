// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/mrpControllers/util/setUpMrpSelect2","app/settings/views/SettingsView","app/planning/templates/settings"],function(t,e,n,i){"use strict";return n.extend({clientUrl:"#planning/settings",template:i,events:t.assign({"change input[data-setting]":function(t){this.updateSetting(t.target.name,t.target.value)}},n.prototype.events),afterRender:function(){n.prototype.afterRender.apply(this,arguments),e(this.$id("wh-ignoredMrps"),{width:"100%",placeholder:" ",sortable:!0,own:!1,view:this})},shouldAutoUpdateSettingField:function(t){return"planning.wh.ignoredMrps"!==t.id},updateSettingField:function(t){t&&"planning.wh.ignoredMrps"===t.id&&this.$id("wh-ignoredMrps").select2("data",t.getValue().map(function(t){return{id:t,text:t}}))}})});