// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../time',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  t,
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

      if (obj.markerColor)
      {
        var color = this.getColor();

        obj.markerColor = '<span class="label" style="background: ' + color.color + '">'
          + color.text
          + '</span>';
      }

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
    },

    getColor: function()
    {
      return this.attributes.markerColor ? this.constructor.getColor(this.attributes.markerColor) : null;
    }

  }, {

    getColor: function(color)
    {
      return {
        id: color,
        text: t('kanbanComponents', 'color:' + color),
        color: color
      };
    }

  });
});
