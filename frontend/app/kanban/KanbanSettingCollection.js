// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../settings/SettingCollection',
  './KanbanSetting'
], function(
  _,
  SettingCollection,
  KanbanSetting
) {
  'use strict';

  return SettingCollection.extend({

    model: KanbanSetting,

    topicSuffix: 'kanban.**',

    getValue: function(suffix)
    {
      var setting = this.get('kanban.' + suffix);

      return setting ? setting.getValue() : null;
    }

  });
});
