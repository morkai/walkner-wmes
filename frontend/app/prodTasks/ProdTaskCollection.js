// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    rqlQuery: 'sort(name)',

    sort: function(options)
    {
      var topLevelTasks = [];
      var parentToChildren = {};
      var i;

      for (i = 0; i < this.length; ++i)
      {
        var model = this.models[i];
        var attrs = model.attributes;

        if (!attrs.parent)
        {
          topLevelTasks.push(model);
        }
        else if (parentToChildren[attrs.parent])
        {
          parentToChildren[attrs.parent].push(model);
        }
        else
        {
          parentToChildren[attrs.parent] = [model];
        }
      }

      var models = [];

      for (i = 0; i < topLevelTasks.length; ++i)
      {
        var topLevelTask = topLevelTasks[i];

        models.push(topLevelTask);

        pushChildTasks(topLevelTask);
      }

      this.models = models;

      if (options && !options.silent)
      {
        this.trigger('sort', this, options || {});
      }

      return this;

      function pushChildTasks(parentTask)
      {
        parentTask.children = parentToChildren[parentTask.id] || [];

        if (!parentTask.children.length)
        {
          return;
        }

        for (var i = 0; i < parentTask.children.length; ++i)
        {
          var childTask = parentTask.children[i];

          models.push(childTask);

          pushChildTasks(childTask);
        }
      }
    },

    serializeToSelect2: function(skipTaskId)
    {
      var data = [];

      this.sort().forEach(function(prodTask)
      {
        if (prodTask.id !== skipTaskId && !prodTask.attributes.parent)
        {
          data.push({
            id: prodTask.id,
            text: prodTask.getLabel(),
            children: getChildren(prodTask),
            prodTask: prodTask
          });
        }
      });

      return data;

      function getChildren(prodTask)
      {
        var children = [];

        if (Array.isArray(prodTask.children))
        {
          for (var i = 0; i < prodTask.children.length; ++i)
          {
            var childProdTask = prodTask.children[i];

            if (childProdTask.id !== skipTaskId)
            {
              children.push({
                id: childProdTask.id,
                text: childProdTask.getLabel(),
                children: getChildren(childProdTask),
                prodTask: childProdTask
              });
            }
          }
        }

        return children;
      }
    }

  });
});
