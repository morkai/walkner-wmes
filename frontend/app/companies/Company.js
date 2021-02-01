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

    urlRoot: '/companies',

    clientUrlRoot: '#companies',

    topicPrefix: 'companies',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'companies',

    labelAttribute: 'name',

    defaults: {
      name: '',
      shortName: '',
      color: '#000000'
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.color = colorLabel(obj.color);

      return obj;
    }

  });
});
