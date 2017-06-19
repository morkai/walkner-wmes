// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kaizen/behaviours',

    clientUrlRoot: '#kaizenBehaviours',

    topicPrefix: 'kaizen.behaviours',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenBehaviours',

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
