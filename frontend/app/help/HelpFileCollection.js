// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './HelpFile'
], function(
  Collection,
  HelpFile
) {
  'use strict';

  return Collection.extend({

    model: HelpFile,

    rqlQuery: 'limit(0)',

    comparator: function(a, b)
    {
      return a.get('name').localeCompare(b.get('name'), undefined, {ignorePunctuation: true, numeric: true});
    },

    initialize: function(models, options)
    {
      this.settings = options && options.settings || null;

      if (this.settings)
      {
        this.state = {
          selected: options && options.selectedFileId || null,
          expanded: {}
        };

        this.rebuildTree();

        this.on('reset', this.rebuildTree);
        this.listenTo(this.settings, 'change', this.onSettingsChange);
      }
    },

    onSettingsChange: function(setting)
    {
      if (/rootFileId/.test(setting.id))
      {
        this.rebuildTree();
      }
    },

    rebuildTree: function()
    {
      var collection = this;

      collection.root = collection.get(collection.settings.getValue('rootFileId')) || null;

      if (!collection.root)
      {
        return;
      }

      collection.forEach(function(file)
      {
        file.parents = [];
        file.children = [];
      });

      collection.forEach(function(childFile)
      {
        var parents = childFile.get('parents');

        parents.forEach(function(parentId)
        {
          var parentFile = collection.get(parentId);

          if (!parentFile)
          {
            return;
          }

          parentFile.children.push(childFile);
          childFile.parents.push(parentFile);
        });
      });
    },

    serializeTree: function()
    {
      if (!this.root)
      {
        return [];
      }

      return this.serializeNode(this.root).children;
    },

    serializeNode: function(file)
    {
      return {
        _id: file.id,
        children: file.children.map(this.serializeNode, this),
        name: file.get('name'),
        description: file.get('description'),
        kind: file.get('kind'),
        selected: this.state.selected === file.id,
        expanded: this.state.expanded[file.id]
      };
    },

    select: function(newId)
    {
      var oldId = this.state.selected;

      if (newId === oldId)
      {
        return;
      }

      this.state.selected = newId;

      this.trigger('selected', newId, oldId);
    },

    toggle: function(id, newState)
    {
      var oldState = this.state.expanded[id] || false;

      if (typeof newState !== 'boolean')
      {
        newState = !oldState;
      }

      if (newState === oldState)
      {
        return;
      }

      this.state.expanded[id] = newState;

      this.trigger('expanded', id, newState);
    }

  });
});
