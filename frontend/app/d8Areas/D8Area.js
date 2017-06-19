// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/d8/areas',

    clientUrlRoot: '#d8/areas',

    topicPrefix: 'd8.areas',

    privilegePrefix: 'D8:DICTIONARIES',

    nlsDomain: 'd8Areas',

    labelAttribute: 'name',

    serializeRow: function()
    {
      var obj = this.toJSON();

      obj.manager = obj.manager ? obj.manager.label : '';

      return obj;
    }

  });
});
