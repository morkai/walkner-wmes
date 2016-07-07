// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/xiconf/hidLamps',

    clientUrlRoot: '#xiconf/hidLamps',

    privilegePrefix: 'XICONF',

    topicPrefix: 'xiconfHidLamps',

    nlsDomain: 'xiconfHidLamps',

    labelAttribute: 'description',

    defaults: function()
    {
      return {
        nc12: '',
        description: '',
        voltage: '',
        family: []
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.family = obj.family.join('; ');

      return obj;
    }

  });
});
