define(["underscore","app/settings/views/SettingsView","app/kaizenOrders/templates/settings"],function(e,t,n){"use strict";return t.extend({clientUrl:"#kaizenOrders;settings",template:n,events:e.assign({"change input[data-setting]":function(e){this.updateSetting(e.target.name,e.target.value)}},t.prototype.events)})});