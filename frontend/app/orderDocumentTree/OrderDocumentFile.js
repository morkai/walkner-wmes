// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model'
], function(
  _,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/orderDocuments/files',

    nlsDomain: 'orderDocumentTree',

    labelAttribute: 'name',

    getLabel: function()
    {
      return (this.get('name') || this.id).replace(/_/g, ' ');
    },

    isInTrash: function()
    {
      return this.isInFolder('__TRASH__');
    },

    isInFolder: function(folderId)
    {
      return _.includes(this.get('folders'), folderId);
    },

    unlinkFolder: function(folderId)
    {
      if (this.isInFolder(folderId))
      {
        this.set('folders', _.without(this.get('folders'), folderId));
      }
    },

    trash: function()
    {
      this.set({
        folders: ['__TRASH__'],
        oldFolders: this.get('folders')
      });
    },

    recover: function()
    {
      this.set({
        folders: this.get('oldFolders'),
        oldFolders: null
      });
    }

  });
});
