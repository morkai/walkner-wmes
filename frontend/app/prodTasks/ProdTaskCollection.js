// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Collection',
  './ProdTask'
], function(
  Collection,
  ProdTask
) {
  'use strict';

  return Collection.extend({

    model: ProdTask,

    rqlQuery: 'sort(parent,name)',

    sort: function(options)
    {
      var topLevel = {};

      for (var i = 0; i < this.length; ++i)
      {
        var model = this.models[i];
        var attrs = model.attributes;

        if (attrs.parent)
        {
          if (!topLevel[attrs.parent])
          {
            topLevel[attrs.parent] = {
              parent: null,
              children: []
            };
          }

          topLevel[attrs.parent].children.push(model);
        }
        else if (!topLevel[attrs._id])
        {
          topLevel[attrs._id] = {
            parent: model,
            children: []
          };
        }
        else if (!topLevel[attrs._id].parent)
        {
          topLevel[attrs._id].parent = model;
        }
      }

      var models = [];

      Object.keys(topLevel).forEach(function(k)
      {
        var item = topLevel[k];

        models.push(item.parent);
        models.push.apply(models, item.children);
      });

      this.models = models;

      if (options && !options.silent)
      {
        this.trigger('sort', this, options || {});
      }

      return this;
    },

    serializeToSelect2: function()
    {
      var data = [];
      var lastParent = {
        id: null,
        text: null,
        children: []
      };

      this.sort().forEach(function(prodTask)
      {
        var parent = prodTask.get('parent');

        if (parent)
        {
          lastParent.children.push({
            id: prodTask.id,
            text: prodTask.getLabel(),
            lastChild: false
          });
        }
        else
        {
          if (lastParent.children.length)
          {
            lastParent.children[lastParent.children.length - 1].lastChild = true;
          }

          lastParent = {
            id: prodTask.id,
            text: prodTask.getLabel(),
            children: []
          };

          data.push(lastParent);
        }
      });

      return data;
    }

  });
});
