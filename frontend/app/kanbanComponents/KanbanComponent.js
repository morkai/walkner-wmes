// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
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
