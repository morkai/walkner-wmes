// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../settings/SettingCollection","./KanbanSetting"],function(e,n,t){"use strict";return n.extend({model:t,topicSuffix:"kanban.**",getValue:function(e){var n=this.get("kanban."+e);return n?n.getValue():null},prepareValue:function(e,n){}})});