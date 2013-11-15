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
      aors: null
    },

    toJSON: function()
    {
      var prodTask = Model.prototype.toJSON.call(this);

      if (!Array.isArray(prodTask.aors))
      {
        prodTask.aors = [];
      }

      return prodTask;
    }

  });
});
