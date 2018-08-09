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
    'darkblue': '#0000BB',
    'violet': '#663399',
    'lavender': '#C7A2C6',
    'lightblue': '#00AAFF',
    'grey': '#A0A0A0',
    'red': '#EE0000',
    'orange': '#FF8800',
    'yellow': '#FFEE00',
    'sand': '#C09D79',
    'green': '#009900',
    'cyan': '#00CDCD',
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
