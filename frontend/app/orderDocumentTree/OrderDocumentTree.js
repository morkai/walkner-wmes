// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../user',
  '../time',
  '../core/Model',
  '../data/localStorage',
  './OrderDocumentFolder',
  './OrderDocumentFolderCollection',
  './OrderDocumentFileCollection',
  './OrderDocumentUploadCollection'
], function(
  _,
  $,
  user,
  time,
  Model,
  localStorage,
  OrderDocumentFolder,
  OrderDocumentFolderCollection,
  OrderDocumentFileCollection,
  OrderDocumentUploadCollection
) {
  'use strict';

  var DISPLAY_MODE_STORAGE_KEY = 'DOCS_DISPLAY_MODE';
  var DISPLAY_MODE = {
    TILES: 'tiles',
    LIST: 'list'
  };

  return Model.extend({

    nlsDomain: 'orderDocumentTree',

    defaults: function()
    {
      return {
        cutFolder: null,
        selectedFile: null,
        selectedFolder: null,
        markedFiles: {},
        expandedFolders: {},
        searchPhrase: '',
        dateFilter: null,
        displayMode: localStorage.getItem(DISPLAY_MODE_STORAGE_KEY) || DISPLAY_MODE.TILES
      };
    },

    initialize: function(attrs, options)
    {
      this.folders = new OrderDocumentFolderCollection(null, {
        paginate: false
      });
      this.files = new OrderDocumentFileCollection(null, {
        paginate: false,
        parentFolderId: this.get('selectedFolder'),
        searchPhrase: this.get('searchPhrase')
      });
      this.uploads = options.uploads || new OrderDocumentUploadCollection(null, {
        paginate: false
      });

      this.folders.once('sync', this.onFoldersSync.bind(this));
    },

    subscribe: function(pubsub)
    {
      pubsub.subscribe('orderDocuments.tree.**', this.onMessage.bind(this));
    },

    getDisplayMode: function()
    {
      return this.get('displayMode');
    },

    setDisplayMode: function(displayMode)
    {
      localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, displayMode);

      this.set('displayMode', displayMode);
    },

    hasDateFilter: function()
    {
      return this.get('dateFilter') !== null;
    },

    getDateFilter: function()
    {
      return this.get('dateFilter');
    },

    setDateFilter: function(dateFilter)
    {
      var moment = time.utc.getMoment(dateFilter, 'YYYY-MM-DD');

      if (!moment.isValid() || moment.diff('2000-01-01T00:00:00Z') < 0)
      {
        dateFilter = null;
      }

      if (dateFilter !== this.get('dateFilter'))
      {
        this.unmarkAllFiles();

        this.set('dateFilter', dateFilter);
      }
    },

    hasSearchPhrase: function()
    {
      return this.get('searchPhrase').length > 0;
    },

    getSearchPhrase: function()
    {
      return this.hasSearchPhrase() ? this.get('searchPhrase') : '';
    },

    setSearchPhrase: function(searchPhrase, options)
    {
      options = _.defaults({}, options, {
        reset: false
      });

      this.unmarkAllFiles();

      if (searchPhrase !== this.get('searchPhrase'))
      {
        this.files.setSearchPhrase(searchPhrase);

        if (options.reset !== false)
        {
          this.files.reset([]);
        }

        this.set('searchPhrase', searchPhrase, options);
      }
    },

    hasSelectedFolder: function()
    {
      return !!this.get('selectedFolder');
    },

    getSelectedFolder: function()
    {
      return this.folders.get(this.get('selectedFolder')) || null;
    },

    setSelectedFolder: function(folderId, options)
    {
      options = _.defaults({}, options, {
        scroll: false,
        keepFile: false,
        updateUrl: true
      });

      if (this.get('selectedFolder') !== folderId)
      {
        this.setSearchPhrase('', {
          reset: false,
          silent: true
        });

        this.files.setParentFolderId(folderId);
        this.files.reset([]);

        if (!options.keepFile)
        {
          this.set('selectedFile', null);
        }

        this.set('selectedFolder', folderId, options);
      }
    },

    hasSelectedFile: function()
    {
      return !!this.get('selectedFile');
    },

    getSelectedFile: function()
    {
      return this.files.get(this.get('selectedFile')) || null;
    },

    setSelectedFile: function(fileId, scroll)
    {
      if (this.get('selectedFile') !== fileId)
      {
        this.set('selectedFile', fileId, {scroll: scroll});
      }
    },

    getMarkedFiles: function()
    {
      return _.values(this.attributes.markedFiles);
    },

    getMarkedFileCount: function()
    {
      return Object.keys(this.attributes.markedFiles).length;
    },

    isMarkedFile: function(file)
    {
      return !!this.attributes.markedFiles[file.id || file];
    },

    toggleMarkFile: function(file)
    {
      if (this.isMarkedFile(file))
      {
        this.unmarkFile(file);
      }
      else
      {
        this.markFile(file);
      }
    },

    markFile: function(file)
    {
      this.attributes.markedFiles[file.id] = file;

      this.trigger('change:markedFiles', this, file, true);
    },

    unmarkFile: function(file)
    {
      file = this.attributes.markedFiles[file.id || file];

      if (file)
      {
        delete this.attributes.markedFiles[file.id];

        this.trigger('change:markedFiles', this, file, false);
      }
    },

    markAllFiles: function()
    {
      var tree = this;

      tree.files.forEach(function(file)
      {
        if (!tree.isMarkedFile(file))
        {
          tree.markFile(file);
        }
      });
    },

    unmarkAllFiles: function()
    {
      var tree = this;

      _.forEach(tree.attributes.markedFiles, function(file)
      {
        tree.unmarkFile(file);
      });
    },

    getRootFolders: function()
    {
      var tree = this;
      var rootFolders = tree.folders.filter(function(folder)
      {
        return folder.isRoot()
          && folder.id !== '__TRASH__'
          && tree.canViewFolder(folder);
      });

      if (tree.canSeeTrash() && tree.folders.get('__TRASH__'))
      {
        rootFolders.push(tree.folders.get('__TRASH__'));
      }

      return rootFolders;
    },

    getChildFolders: function(parentFolder)
    {
      var tree = this;

      if (!parentFolder)
      {
        return this.getRootFolders();
      }

      return parentFolder.get('children')
        .map(function(folderId) { return tree.folders.get(folderId); })
        .filter(function(folder) { return !!folder; })
        .sort(function(a, b) { return a.getLabel().localeCompare(b.getLabel()); });
    },

    isFolderCut: function(folderId)
    {
      return this.attributes.cutFolder === folderId;
    },

    isFolderSelected: function(folderId)
    {
      return this.attributes.selectedFolder === folderId;
    },

    isFolderExpanded: function(folderId)
    {
      return this.attributes.expandedFolders[folderId];
    },

    toggleFolder: function(folderId, expanded)
    {
      var expandedFolders = this.attributes.expandedFolders;

      if (folderId === null)
      {
        this.folders.forEach(function(folder)
        {
          expandedFolders[folder.id] = expanded;
        });

        this.trigger('change:expandedFolders', folderId, expanded);

        return;
      }

      var oldValue = !!expandedFolders[folderId];
      var newValue = expanded === undefined ? !oldValue : expanded;

      if (newValue === oldValue)
      {
        return;
      }

      expandedFolders[folderId] = newValue;

      this.trigger('change:expandedFolders', folderId, newValue);
    },

    getRoot: function(folder)
    {
      return this.getPath(folder)[0];
    },

    getPath: function(folder)
    {
      var path = [];

      if (!folder)
      {
        folder = this.getSelectedFolder();
      }

      if (!folder)
      {
        return path;
      }

      while (folder)
      {
        path.unshift(folder);

        folder = this.folders.get(folder.get('parent'));
      }

      return path;
    },

    isTrash: function()
    {
      var selectedFolder = this.getSelectedFolder();

      return !!selectedFolder && selectedFolder.id === '__TRASH__';
    },

    isInTrash: function(folder)
    {
      return !!folder && this.getRoot(folder).id === '__TRASH__';
    },

    canSeeTrash: function()
    {
      return user.isAllowedTo('DOCUMENTS:MANAGE');
    },

    canViewFile: function(file)
    {
      var tree = this;

      return file.get('folders').some(function(folderId)
      {
        return tree.canViewFolder(tree.folders.get(folderId));
      });
    },

    canViewFolder: function(folder)
    {
      return this.checkFolderAccess(folder, true);
    },

    canManageFolder: function(folder)
    {
      return user.isAllowedTo('DOCUMENTS:MANAGE') && this.checkFolderAccess(folder, false);
    },

    checkFolderAccess: function(folder, emptyAccess)
    {
      if (user.isAllowedTo('DOCUMENTS:ALL'))
      {
        return true;
      }

      if (!folder)
      {
        return false;
      }

      if (!folder.isRoot())
      {
        var parent = this.folders.get(folder.get('parent'));

        return parent ? this.checkFolderAccess(parent, emptyAccess) : false;
      }

      var funcs = folder.get('funcs');

      if (!funcs || !funcs.length)
      {
        return emptyAccess;
      }

      return funcs.includes(user.data.prodFunction);
    },

    canMoveFolder: function(movedFolder, newParentFolder)
    {
      if (newParentFolder && newParentFolder.id === movedFolder.id)
      {
        return false;
      }

      var oldParentFolder = this.folders.get(movedFolder.get('parent')) || null;

      if (newParentFolder === oldParentFolder)
      {
        return false;
      }

      var path = this.getPath(newParentFolder);

      for (var i = 0; i < path.length; ++i)
      {
        if (path[i] === movedFolder)
        {
          return false;
        }
      }

      return true;
    },

    addUpload: function(fileId, hash)
    {
      var selectedFolder = this.getSelectedFolder();

      if (this.isInTrash(selectedFolder))
      {
        return;
      }

      var documentFile = this.files.get(fileId);

      var documentFolder = this.hasSearchPhrase()
        ? this.folders.get(documentFile.get('folders')[0])
        : selectedFolder;

      this.uploads.addFromDocument(documentFile, documentFolder, hash);
    },

    removeFolder: function(folder)
    {
      this.setSelectedFolder(folder.get('parent'), {scroll: true});

      return this.act('removeFolder', {
        folderId: folder.id
      });
    },

    moveFolder: function(folder, newParentFolder)
    {
      var tree = this;
      var selectedFolder = tree.getSelectedFolder();
      var oldParentFolderId = folder.get('parent');
      var oldCutFolder = tree.get('cutFolder');

      tree.set('cutFolder', null);
      tree.folders.handleFolderMoved(folder.id, newParentFolder ? newParentFolder.id : null);
      tree.setSelectedFolder(folder.id, {scroll: true});

      var req = tree.act('moveFolder', {
        folderId: folder.id,
        parentId: newParentFolder ? newParentFolder.id : null
      });

      req.fail(function()
      {
        tree.folders.handleFolderMoved(folder.id, oldParentFolderId);
        tree.setSelectedFolder(selectedFolder ? selectedFolder.id : null, {scroll: true});
        tree.set('cutFolder', oldCutFolder);
      });

      return req;
    },

    addFolder: function(folder)
    {
      var tree = this;
      var selectedFolder = tree.getSelectedFolder();

      tree.folders.handleFolderAdded(folder);
      tree.setSelectedFolder(folder.id, {scroll: true});

      var req = tree.act('addFolder', {
        folder: folder.toJSON()
      });

      req.fail(function()
      {
        tree.folders.handleFolderPurged(folder.id);
        tree.setSelectedFolder(selectedFolder ? selectedFolder.id : null, {scroll: true});
      });

      return req;
    },

    renameFolder: function(folder, newName)
    {
      var tree = this;
      var oldName = folder.get('name');

      tree.folders.handleFolderRenamed(folder.id, newName);

      var req = tree.act('renameFolder', {
        folderId: folder.id,
        name: newName
      });

      req.fail(function()
      {
        tree.folders.handleFolderRenamed(folder.id, oldName);
      });

      return req;
    },

    editFolder: function(folder, newData)
    {
      var tree = this;
      var oldData = Object.assign({}, folder.attributes);

      tree.folders.handleFolderEdited(folder.id, newData);

      var req = tree.act('editFolder', {
        folderId: folder.id,
        data: newData
      });

      req.fail(function()
      {
        tree.folders.handleFolderEdited(folder.id, oldData);
      });

      return req;
    },

    recoverFolder: function(folder)
    {
      var tree = this;

      tree.folders.handleFolderRecovered(folder.id);

      var req = this.act('recoverFolder', {
        folderId: folder.id
      });

      req.fail(function()
      {
        tree.folders.handleFolderRemoved(folder.id);
      });

      return req;
    },

    purgeFolder: function(folder)
    {
      return this.act('purgeFolder', {
        folderId: folder.id
      });
    },

    addFiles: function()
    {
      return this.act('addFiles', {
        files: this.uploads.serializeFiles()
      });
    },

    editFile: function(file, changes)
    {
      return this.act('editFile', {
        fileId: file.id,
        changes: changes
      });
    },

    unlinkFile: function(file, folder)
    {
      return this.act('unlinkFile', {
        fileId: file.id,
        folderId: folder.id
      });
    },

    unlinkFiles: function(files, folder, remove)
    {
      return this.act('unlinkFiles', {
        fileIds: files.map(function(file) { return file.id; }),
        folderId: folder.id,
        remove: !!remove
      });
    },

    recoverFile: function(file)
    {
      return this.act('recoverFile', {
        fileId: file.id
      });
    },

    recoverFiles: function(files, remove)
    {
      return this.act('recoverFiles', {
        fileIds: files.map(function(file) { return file.id; }),
        remove: !!remove
      });
    },

    removeFile: function(file)
    {
      return this.act('removeFile', {
        fileId: file.id
      });
    },

    removeFiles: function(files)
    {
      return this.act('removeFiles', {
        fileIds: files.map(function(file) { return file.id; })
      });
    },

    purgeFile: function(file)
    {
      return this.act('purgeFile', {
        fileId: file.id
      });
    },

    purgeFiles: function(files, folder)
    {
      return this.act('purgeFiles', {
        fileIds: files.map(function(file) { return file.id; }),
        folderId: folder.id
      });
    },

    act: function(action, params)
    {
      return $.ajax({
        type: 'POST',
        url: '/orderDocuments/tree',
        data: JSON.stringify({
          action: action,
          params: params
        })
      });
    },

    /**
     * @private
     */
    onFoldersSync: function()
    {
      this.expandSelectedFolder();

      if (this.get('selectedFolder') && !this.getSelectedFolder())
      {
        this.setSelectedFolder(null);
      }
    },

    /**
     * @private
     */
    expandSelectedFolder: function()
    {
      var selectedFolder = this.getSelectedFolder();

      if (!selectedFolder)
      {
        return;
      }

      var expandedFolders = this.attributes.expandedFolders;
      var folderId = selectedFolder.get('parent');

      expandedFolders[selectedFolder.id] = true;

      while (folderId)
      {
        expandedFolders[folderId] = true;

        var folder = this.folders.get(folderId);

        if (!folder)
        {
          break;
        }

        folderId = folder.get('parent');
      }
    },

    /**
     * @private
     * @param {Object} message
     * @param {string} topic
     */
    onMessage: function(message, topic)
    {
      var parts = topic.split('.');

      switch (parts[2])
      {
        case 'fileAdded':
          this.files.handleFileAdded(message.file);
          this.uploads.remove(message.uploadId);
          break;

        case 'fileEdited':
          this.files.handleFileEdited(message.file, this.get('selectedFolder'));
          this.uploads.remove(message.uploadId);
          break;

        case 'fileUnlinked':
          this.files.handleFileUnlinked(message.file._id, message.folderId);
          this.unmarkFile(message.file._id);
          break;

        case 'fileRemoved':
          this.files.handleFileRemoved(message.file._id);
          this.unmarkFile(message.file._id);
          break;

        case 'fileRecovered':
          this.files.handleFileRecovered(message.file._id);
          break;

        case 'filePurged':
          this.files.handleFilePurged(message.file._id);

          if (this.get('selectedFile') === message.file._id)
          {
            this.setSelectedFile(null);
          }
          break;

        case 'folderAdded':
          this.folders.handleFolderAdded(new OrderDocumentFolder(message.folder));
          break;

        case 'folderRenamed':
          this.folders.handleFolderRenamed(message.folder._id, message.folder.name);
          break;

        case 'folderEdited':
          this.folders.handleFolderEdited(message.folder);
          break;

        case 'folderMoved':
          this.folders.handleFolderMoved(message.folder._id, message.folder.parent);
          break;

        case 'folderRemoved':
          this.folders.handleFolderRemoved(message.folder._id);
          break;

        case 'folderRecovered':
          this.folders.handleFolderRecovered(message.folder._id);
          break;

        case 'folderPurged':
          this.folders.handleFolderPurged(message.folder._id);

          if (this.get('selectedFolder') === message.folder._id)
          {
            this.setSelectedFolder(this.folders.get(message.folder.parent) ? message.folder.parent : null, {
              scroll: true,
              updateUrl: false
            });
          }
          break;
      }
    }

  }, {

    DISPLAY_MODE: DISPLAY_MODE

  });
});
