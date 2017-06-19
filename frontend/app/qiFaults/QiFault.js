// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/qi/faults',

    clientUrlRoot: '#qi/faults',

    topicPrefix: 'qi.faults',

    privilegePrefix: 'QI:DICTIONARIES',

    nlsDomain: 'qiFaults',

    serialize: function()
    {
      var obj = this.toJSON();

      if (!obj.description)
      {
        obj.description = '-';
      }

      return obj;
    }

  });
});
