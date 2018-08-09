// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../settings/SettingCollection","./KanbanSetting"],function(n,e,t){"use strict";return e.extend({model:t,topicSuffix:"kanban.**",getValue:function(n){var e=this.get("kanban."+n);return e?e.getValue():null}})});