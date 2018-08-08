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

  var MARKER_COLORS = {
    'red': '#DB342D',
    'yellow': '#F4C605',
    'orange': '#E46D29',
    'green': '#00FF00',
    'lightgreen': '#A7C6C4',
    'violet': '#612B7D',
    'lavender': '#B183B2',
    'lightblue': '#29AADD',
    'darkblue': '#194F90',
    'sand': '#E1AE57',
    'cyan': '#66BCA3',
    'black': '#000000'
  };

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
        color: MARKER_COLORS[color] || color
      };
    }

  });
});
