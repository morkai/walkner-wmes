// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/View',
  'app/core/templates/userInfo',
  '../OrderDocumentChangeCollection',
  'app/orderDocumentTree/templates/fileChanges'
], function(
  _,
  time,
  View,
  renderUserInfo,
  OrderDocumentChangeCollection,
  template
) {
  'use strict';

  return View.extend({

    dialogClassName: 'orderDocumentTree-changes-dialog',

    template: template,

    initialize: function()
    {
      this.state = 'loading';
      this.changes = new OrderDocumentChangeCollection(null, {
        paginate: false,
        rqlQuery: 'sort(time)&limit(0)&nc15=' + this.options.nc15
      });

      this.listenTo(this.changes, 'request', this.updateState.bind(this, 'loading'));
      this.listenTo(this.changes, 'error', this.updateState.bind(this, 'error'));
      this.listenTo(this.changes, 'sync', this.updateState.bind(this, 'loaded'));

      this.promised(this.changes.fetch({reset: true}));
    },

    updateState: function(newState)
    {
      this.state = newState;
      this.render();
    },

    getTemplateData: function()
    {
      var view = this;
      var last = {
        name: '',
        folders: '',
        files: ''
      };

      return {
        state: view.state,
        changes: view.changes.map(function(change)
        {
          var file = change.get('data');
          var name = '';

          if (file && file.name && file.name !== last.name)
          {
            name = last.name = file.name;
          }

          return {
            time: time.format(change.get('time'), 'L, HH:mm:ss'),
            user: renderUserInfo({userInfo: change.get('user')}),
            type: view.t('fileChanges:type:' + change.get('type')),
            name: name,
            folders: view.serializeFolders(file, last),
            files: view.serializeFiles(file, last)
          };
        })
      };
    },

    serializeFolders: function(file, last)
    {
      if (!file || !Array.isArray(file.folders))
      {
        return '';
      }

      var newFolders = JSON.stringify(file.folders);

      if (newFolders === last.folders)
      {
        return '';
      }

      last.folders = newFolders;

      var tree = this.model;
      var folders = file.folders.map(function(folderId)
      {
        var folder = tree.folders.get(folderId);

        if (!folder)
        {
          return '<li>' + folderId;
        }

        var path = tree.getPath(folder)
          .map(function(folder) { return folder.getLabel(); })
          .join(' > ');

        return '<li title="' + _.escape(path) + '">' + _.escape(folder.getLabel());
      });

      return '<ul class="orderDocumentTree-changes-list">' + folders.join('') + '</ul>';
    },

    serializeFiles: function(file, last)
    {
      if (!file || !Array.isArray(file.files))
      {
        return '';
      }

      var newFiles = JSON.stringify(file.files);

      if (newFiles === last.files)
      {
        return '';
      }

      last.files = newFiles;

      var view = this;
      var html = '';

      file.files.forEach(function(f)
      {
        html += '<li><a target="_blank" href="/orderDocuments/' + file._id + '?pdf=1&hash=' + f.hash + '">'
          + view.t('files:files:date', {date: time.utc.format(f.date, 'LL')})
          + '</a>';
      });

      if (html)
      {
        return '<ul>' + html + '</ul>';
      }

      return '';
    }

  });
});
