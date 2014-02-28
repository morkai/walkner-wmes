define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodTasks',

    clientUrlRoot: '#prodTasks',

    topicPrefix: 'prodTasks',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'prodTasks',

    labelAttribute: 'name',

    defaults: {
      name: null,
      tags: null,
      prodDiv: false,
      clipColor: '#eeee00'
    },

    parse: function(data)
    {
      if (!Array.isArray(data.tags))
      {
        data.tags = [];
      }

      if (!data.clipColor)
      {
        data.clipColor = '#eeee00';
      }

      return data;
    }

  });
});
