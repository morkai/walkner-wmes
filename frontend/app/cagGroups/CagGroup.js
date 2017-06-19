// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  'app/core/util/colorLabel'
], function(
  Model,
  colorLabel
) {
  'use strict';

  return Model.extend({

    urlRoot: '/cagGroups',

    clientUrlRoot: '#cagGroups',

    topicPrefix: 'cagGroups',

    privilegePrefix: 'REPORTS',

    nlsDomain: 'cagGroups',

    labelAttribute: 'name',

    defaults: {
      color: '#FFFFFF'
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.color = colorLabel(obj.color);
      obj.cags = obj.cags.join(', ');

      return obj;
    }

  });
});
