// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  '../settings/SettingCollection',
  './KanbanSetting'
], function(
  _,
  t,
  SettingCollection,
  KanbanSetting
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

  return SettingCollection.extend({

    model: KanbanSetting,

    topicSuffix: 'kanban.**',

    getValue: function(suffix)
    {
      var setting = this.get('kanban.' + suffix);

      return setting ? setting.getValue() : null;
    },

    updateRowColor: function(row, color)
    {
      var rowColors = _.clone(this.getValue('rowColors'));

      if (!_.isObject(rowColors))
      {
        rowColors = {};
      }

      if (color)
      {
        rowColors[row] = color;
      }
      else
      {
        delete rowColors[row];
      }

      return this.update('kanban.rowColors', rowColors);
    },

    getRowColor: function(row)
    {
      var rowColors = this.getValue('rowColors');

      return rowColors && rowColors[row] || null;
    },

    getMarkerColor: function(color)
    {
      return this.constructor.getMarkerColor(color);
    }

  }, {

    MARKER_COLORS: Object.keys(MARKER_COLORS),

    getMarkerColors: function()
    {
      return this.MARKER_COLORS.map(this.getMarkerColor);
    },

    getMarkerColor: function(color)
    {
      return {
        id: color,
        text: t('kanban', 'color:' + color),
        color: MARKER_COLORS[color] || color
      };
    }

  });
});
