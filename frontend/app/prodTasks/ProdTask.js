// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Model',
  'app/core/util/colorLabel'
], function(
  t,
  Model,
  colorLabel
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
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.tags = obj.tags.length ? obj.tags.join(', ') : '-';
      obj.fteDiv = t('core', 'BOOL:' + !!obj.fteDiv);
      obj.inProd = t('core', 'BOOL:' + !!obj.inProd);

      if (obj.clipColor)
      {
        obj.clipColor = colorLabel(obj.clipColor);
      }

      var parentTask = this.collection ? this.collection.get(obj.parent) : null;

      if (typeof obj.parent === 'string')
      {
        parentTask = this.collection ? this.collection.get(obj.parent) : null;

        if (parentTask)
        {
          obj.parent = parentTask.getLabel();
        }
      }
      else if (obj.parent)
      {
        obj.parent = obj.parent.name;
      }

      if (!obj.parent)
      {
        obj.parent = '';
      }

      return obj;
    }

  });
});
