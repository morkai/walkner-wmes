// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  './UnlinkFilesDialogView',
  './RemoveFilesDialogView',
  'app/orderDocumentTree/templates/toolbar'
], function(
  _,
  $,
  t,
  time,
  viewport,
  View,
  UnlinkFilesDialogView,
  RemoveFilesDialogView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'change input[name="displayMode"]': function()
      {
        this.model.setDisplayMode(this.$('input[name="displayMode"]:checked').val());
      },

      'submit #-searchForm': function()
      {
        this.model.setSearchPhrase(this.$id('searchPhrase').val());

        return false;
      },

      'keydown #-searchPhrase': function(e)
      {
        if (e.keyCode === 27)
        {
          this.model.setSearchPhrase('');

          return false;
        }
      },

      'mousedown #-copyToClipboard': function()
      {
        this.captureCopy = true;

        document.execCommand('copy');
      },

      'click #-unlinkMarkedFiles': function(e)
      {
        e.currentTarget.disabled = true;

        var dialogView = new UnlinkFilesDialogView({
          model: {
            tree: this.model,
            files: this.model.getMarkedFiles(),
            folder: this.model.getSelectedFolder()
          }
        });

        dialogView.once('dialog:hidden', this.toggleMarkedButtons.bind(this));

        viewport.showDialog(dialogView, t('orderDocumentTree', 'unlinkFiles:title'));
      },

      'click #-removeMarkedFiles': function(e)
      {
        e.currentTarget.disabled = true;

        var dialogView = new RemoveFilesDialogView({
          model: {
            tree: this.model,
            files: this.model.getMarkedFiles()
          }
        });

        dialogView.once('dialog:hidden', this.toggleMarkedButtons.bind(this));

        viewport.showDialog(dialogView, t('orderDocumentTree', 'removeFiles:title'));
      }

    },

    initialize: function()
    {
      var view = this;
      var tree = view.model;

      view.captureCopy = false;
      view.loadingFiles = false;

      view.listenTo(tree, 'change:searchPhrase change:selectedFolder', view.updateCountersAndSearchPhrase);
      view.listenTo(tree, 'change:markedFiles', view.onMarkedFilesChange);
      view.listenTo(tree.folders, 'reset add remove change:parent', view.updateFolderCount);
      view.listenTo(tree.files, 'request', view.onFilesRequest);
      view.listenTo(tree.files, 'sync', view.onFilesSync);
      view.listenTo(tree.files, 'reset add remove', view.updateFileCount);

      $(document).on('copy.' + view.idPrefix, view.onCopy.bind(view));
    },

    destroy: function()
    {
      $(document).off('.' + this.idPrefix);
    },

    onCopy: function(e)
    {
      if (!this.captureCopy)
      {
        return;
      }

      this.captureCopy = false;

      e.preventDefault();

      var rows = [];

      this.model.files.forEach(function(file)
      {
        var row = [file.id, file.getLabel()];

        file.get('files').forEach(function(f)
        {
          row.push(time.utc.format(f.date, 'L'));
        });

        rows.push(row);
      });

      if (!rows.length)
      {
        return;
      }

      e.originalEvent.clipboardData.setData(
        'text/plain',
        rows.map(function(row) { return row.join('\t'); }).join('\r\n')
      );

      var html = '<table><tr>';

      rows.forEach(function(row)
      {
        html += '<tr>';

        row.forEach(function(cell, i)
        {
          html += '<td>' + (i < 2 ? "'" : '') + cell + '</td>';
        });

        html += '</tr>';
      });

      html += '</table>';

      e.originalEvent.clipboardData.setData('text/html', html);

      viewport.msg.show({
        type: 'info',
        time: 2000,
        text: t('orderDocumentTree', 'toolbar:copyToClipboard:success', {rows: rows.length})
      });
    },

    serialize: function()
    {
      return _.assign(View.prototype.serialize.apply(this, arguments), {
        displayMode: this.model.getDisplayMode(),
        searchPhrase: this.model.getSearchPhrase(),
        folderCount: this.serializeFolderCount(),
        fileCount: this.serializeFileCount(),
        markedFileCount: this.model.getMarkedFileCount()
      });
    },

    serializeFolderCount: function()
    {
      var tree = this.model;

      if (tree.hasSearchPhrase())
      {
        return 0;
      }

      if (tree.hasSelectedFolder())
      {
        return tree.getSelectedFolder().get('children').length;
      }

      return tree.getRootFolders().length;
    },

    serializeFileCount: function()
    {
      var tree = this.model;

      if (tree.files.length)
      {
        return tree.files.totalCount;
      }

      return this.loadingFiles ? '?' : 0;
    },

    updateCountersAndSearchPhrase: function()
    {
      this.updateFolderCount();
      this.updateFileCount();
      this.updateSearchPhrase();
    },

    updateSearchPhrase: function()
    {
      this.$id('searchPhrase').val(this.model.getSearchPhrase());
    },

    updateFolderCount: function()
    {
      this.$id('folderCount').text(this.serializeFolderCount());
    },

    updateFileCount: function()
    {
      this.$id('fileCount').text(this.serializeFileCount());
    },

    updateMarkedFileCount: function()
    {
      this.$id('markedFileCount').text(this.model.getMarkedFileCount());
    },

    toggleMarkedButtons: function()
    {
      var disabled = !this.model.getMarkedFileCount();

      this.$id('unlinkMarkedFiles').prop('disabled', disabled);
      this.$id('removeMarkedFiles').prop('disabled', disabled);
    },

    onFilesRequest: function()
    {
      this.loadingFiles = true;

      this.updateFileCount();
    },

    onFilesSync: function()
    {
      this.loadingFiles = false;

      this.updateFileCount();
    },

    onMarkedFilesChange: function()
    {
      this.toggleMarkedButtons();
      this.updateMarkedFileCount();
    }

  });
});
