// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  Model,
  renderUserInfo
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kanban/components',

    clientUrlRoot: '#kanban/components',

    topicPrefix: 'kanban.components',

    privilegePrefix: 'KANBAN',

    nlsDomain: 'kanbanComponents',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.createdAt = time.format(obj.createdAt, 'LLLL');
      obj.updatedAt = time.format(obj.updatedAt, 'LLLL');
      obj.updater = renderUserInfo({userInfo: obj.updater});

      obj.lastUsageAt = 0;

      _.forEach(obj.usage, function(time)
      {
        obj.lastUsageAt = Math.max(time, obj.lastUsageAt);
      });

      obj.lastUsageAt = time.format(obj.lastUsageAt, 'LL');

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      if (obj.newStorageBin && obj.storageBin !== obj.newStorageBin)
      {
        obj.storageBins = '<del>' + obj.storageBin + '</del> ' + obj.newStorageBin;
      }
      else
      {
        obj.storageBins = obj.storageBin;
      }

      return obj;
    }

  });
});
