// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/settings/views/SettingsView","app/kanban/templates/settings"],function(t,e,n){"use strict";return e.extend({clientUrl:"#kanban;settings",template:n,events:t.assign({"change input[data-setting]":function(t){this.updateSetting(t.target.name,t.target.value)}},e.prototype.events)})});