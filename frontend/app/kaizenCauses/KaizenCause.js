// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kaizen/causes',

    clientUrlRoot: '#kaizenCauses',

    topicPrefix: 'kaizen.causes',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenCauses',

    labelAttribute: 'name',

    defaults: {},

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
