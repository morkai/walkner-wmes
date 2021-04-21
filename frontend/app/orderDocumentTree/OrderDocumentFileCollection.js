// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Collection',
  './OrderDocumentFile'
], function(
  _,
  Collection,
  OrderDocumentFile
) {
  'use strict';

  return Collection.extend({

    model: OrderDocumentFile,

    rqlQuery: 'sort(_id)&folders=null',

    initialize: function(models, options)
    {
      this.parentFolderId = null;
      this.searchPhrase = '';
      this.totalCount = 0;

      if (options && options.parentFolderId)
      {
        this.setParentFolderId(options.parentFolderId);
      }

      if (options && options.searchPhrase)
      {
        this.setSearchPhrase(options.searchPhrase);
      }
    },

    parse: function(res)
    {
      this.totalCount = res.totalCount || 0;

      return res.collection || [];
    },

    setParentFolderId: function(newParentFolderId)
    {
      this.parentFolderId = newParentFolderId;

      this.updateRqlQuery();
    },

    setSearchPhrase: function(newSearchPhrase)
    {
      this.searchPhrase = newSearchPhrase;

      this.updateRqlQuery();
    },

    updateRqlQuery: function()
    {
      var rqlQuery = 'sort(_id)';
      var searchPhrase = this.searchPhrase;

      if (searchPhrase)
      {
        rqlQuery += '&limit(75)';

        if (searchPhrase.length < 15 || /[#*]/.test(searchPhrase))
        {
          var pattern = searchPhrase.replace(/#/g, '.').replace(/\*/g, '.+');

          rqlQuery += '&_id=regex=' + encodeURIComponent('^' + pattern + '$');
        }
        else if (searchPhrase.length > 15)
        {
          var ids = searchPhrase
            .split(/\s+/)
            .map(function(v) { return 'string:' + v; })
            .join(',');

          rqlQuery += '&_id=in=(' + ids + ')';
        }
        else
        {
          rqlQuery = '_id=string:' + searchPhrase;
        }
      }
      else
      {
        rqlQuery += '&folders=' + (this.parentFolderId || 'null');
      }

      this.rqlQuery = this.createRqlQuery(rqlQuery);
    },

    handleFileRemoved: function(fileId)
    {
      var file = this.get(fileId);

      if (file)
      {
        file.trash();
      }
    },

    handleFileRecovered: function(fileId)
    {
      var file = this.get(fileId);

      if (file)
      {
        file.recover();
      }
    },

    handleFilePurged: function(fileId)
    {
      var file = this.get(fileId);

      if (file)
      {
        this.remove(file);
      }
    },

    handleFileUnlinked: function(fileId, folderId)
    {
      var file = this.get(fileId);

      if (file)
      {
        file.unlinkFolder(folderId);
      }
    },

    handleFileEdited: function(newFile, selectedFolderId)
    {
      var file = this.get(newFile._id);

      if (file)
      {
        file.set(newFile);
      }
      else if (_.includes(newFile.folders, selectedFolderId))
      {
        this.add(newFile);
      }
    },

    handleFileAdded: function(newFile)
    {
      var file = this.get(newFile._id);

      if (file)
      {
        file.set(newFile);
      }
      else
      {
        this.add(newFile);
      }
    }

  });
});
