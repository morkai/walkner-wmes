// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './OrderDocumentFolder'
], function(
  Collection,
  OrderDocumentFolder
) {
  'use strict';

  return Collection.extend({

    model: OrderDocumentFolder,

    rqlQuery: 'sort(name)',

    handleFolderAdded: function(folder)
    {
      if (this.get(folder.id))
      {
        return;
      }

      this.add(folder);

      var parent = this.get(folder.get('parent'));

      if (parent)
      {
        parent.addChildFolder(folder);
      }
    },

    handleFolderPurged: function(folderId)
    {
      var folder = this.get(folderId);

      if (!folder)
      {
        return;
      }

      this.remove(folder);

      var parent = this.get(folder.get('parent'));

      if (parent)
      {
        parent.removeChildFolder(folder);
      }
    },

    handleFolderRemoved: function(folderId)
    {
      var folder = this.get(folderId);

      if (!folder || folder.get('parent') === '__TRASH__')
      {
        return;
      }

      folder.set({
        parent: '__TRASH__',
        oldParent: folder.get('parent')
      });

      var parent = this.get(folder.get('oldParent'));

      if (parent)
      {
        parent.removeChildFolder(folder);
      }
    },

    handleFolderMoved: function(folderId, newParentId)
    {
      var folder = this.get(folderId);

      if (!folder)
      {
        return;
      }

      var oldParentId = folder.get('parent');
      var oldParent = this.get(oldParentId);
      var newParent = this.get(newParentId);

      folder.set({
        parent: newParentId,
        oldParent: null
      }, {
        oldParentId: oldParentId
      });

      if (oldParent)
      {
        oldParent.removeChildFolder(folder);
      }

      if (newParent)
      {
        newParent.addChildFolder(folder);
      }
    },

    handleFolderRenamed: function(folderId, newName)
    {
      var folder = this.get(folderId);

      if (folder)
      {
        folder.set('name', newName);
      }
    },

    handleFolderRecovered: function(folderId)
    {
      var folder = this.get(folderId);

      if (folder && folder.isInTrash())
      {
        folder.set({
          parent: this.get('oldParent'),
          oldParent: null
        });
      }
    }

  });
});
