// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Model'
], function(
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kanban/supplyAreas',

    clientUrlRoot: '#kanban/supplyAreas',

    topicPrefix: 'kanban.supplyAreas',

    privilegePrefix: 'KANBAN',

    nlsDomain: 'kanbanSupplyAreas',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.lines = (obj.lines || []).join('; ');

      if (obj.markerColor)
      {
        var color = this.getColor();

        obj.markerColor = '<span class="label" style="background: ' + color.color + '">'
          + color.text
          + '</span>';
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
        text: t('kanbanSupplyAreas', 'color:' + color),
        color: color
      };
    }

  });
});
