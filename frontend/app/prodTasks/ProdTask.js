// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
      fteDiv: false,
      inProd: true,
      clipColor: '#eeee00',
      parent: null
    },

    url: function()
    {
      var url = Model.prototype.url.apply(this, arguments);

      if (this.isNew())
      {
        return url;
      }

      return url + '?populate(parent)';
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
