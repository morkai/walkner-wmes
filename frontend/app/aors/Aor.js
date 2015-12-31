// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  'app/core/util/colorLabel'
], function(
  Model,
  colorLabel
) {
  'use strict';

  return Model.extend({

    urlRoot: '/aors',

    clientUrlRoot: '#aors',

    topicPrefix: 'aors',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'aors',

    labelAttribute: 'name',

    defaults: {
      name: null,
      description: null,
      color: '#f08f44',
      refColor: '#ffa85c',
      refValue: 0
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.color = colorLabel(obj.color);
      obj.refColor = colorLabel(obj.refColor);
      obj.refValue = obj.refValue && obj.refValue.toLocaleString ? obj.refValue.toLocaleString() : '0';

      return obj;
    }

  });
});
