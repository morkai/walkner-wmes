// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  './UnlinkFilesDialogView',
  './RemoveFilesDialogView',
  './RecoverFilesDialogView',
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
  RecoverFilesDialogView,
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

      'change #-date': function()
      {
        this.model.setDateFilter(this.$id('date').val());
      },

      'submit #-searchForm': function()
      {
        this.model.setSearchPhrase(this.$id('searchPhrase').val());

        return false;
      },

      'keydown #-searchPhrase': function(e)
      {
        if (e.key === 'Escape')
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

        var tree = this.model;
        var dialogView = new UnlinkFilesDialogView({
          model: {
            tree: tree,
            files: tree.getMarkedFiles(),
            folder: tree.getSelectedFolder()
          }
        });

        dialogView.once('dialog:hidden', this.toggleMarkedButtons.bind(this));

        viewport.showDialog(dialogView, t('orderDocumentTree', 'unlinkFiles:title'));
      },

      'click #-removeMarkedFiles': function(e)
      {
        e.currentTarget.disabled = true;

        var tree = this.model;
        var dialogView = new RemoveFilesDialogView({
          model: {
            tree: tree,
            files: tree.getMarkedFiles(),
            folder: tree.getSelectedFolder(),
            purge: tree.isInTrash(this.model.getSelectedFolder())
          }
        });

        dialogView.once('dialog:hidden', this.toggleMarkedButtons.bind(this));

        viewport.showDialog(dialogView, t('orderDocumentTree', 'removeFiles:title'));
      },

      'click #-recoverMarkedFiles': function(e)
      {
        e.currentTarget.disabled = true;

        var dialogView = new RecoverFilesDialogView({
          model: {
            tree: this.model,
            files: this.model.getMarkedFiles()
          }
        });

        dialogView.once('dialog:hidden', this.toggleMarkedButtons.bind(this));

        viewport.showDialog(dialogView, t('orderDocumentTree', 'recoverFiles:title'));
      },

      'click #-editMarkedFiles': function()
      {
        var tree = this.model;

        tree.getMarkedFiles().forEach(function(file)
        {
          var latestFile = file.get('files')[0];

          if (latestFile)
          {
            tree.addUpload(file.id, latestFile.hash);
          }
        });
      },

      'focus #-searchPhrase': function()
      {
        var view = this;
        var $form = view.$id('searchForm').css({position: 'relative'});
        var $phrase = view.$id('searchPhrase');
        var $textarea = $form.find('textarea');

        if (!$textarea.length)
        {
          $textarea = $('<textarea class="form-control" rows="4"></textarea>')
            .css({
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 3
            })
            .appendTo($form)
            .on('blur', function()
            {
              hide(false);
            })
            .on('keydown', function(e)
            {
              if (e.key === 'Escape')
              {
                $textarea.val('');

                hide(true);

                return false;
              }

              if (e.key === 'Enter')
              {
                if (e.ctrlKey || e.timeStamp - $textarea.data('lastEnterTs') <= 200)
                {
                  hide(true);

                  return false;
                }

                $textarea.data('lastEnterTs', e.timeStamp);
              }
            });
        }

        $textarea.val($phrase.val().split(/\s+/).join('\n'));

        setTimeout(function() { $textarea.focus(); }, 1);

        function hide(submit)
        {
          var $phrase = view.$id('searchPhrase');
          var $form = view.$id('searchForm').css({position: ''});
          var $textarea = $form.find('textarea');
          var phrase = $textarea.val().trim();
          var pattern = '';

          if (/^[0-9]{3,14}$/.test(phrase))
          {
            phrase = '*' + phrase + '*';
          }

          var codes = phrase.split(/\s+/).filter(function(word)
          {
            if (/^[0-9]{15}$/.test(word))
            {
              return true;
            }

            if (/[0-9]{3,}/.test(word) && /[#*]/.test(word))
            {
              pattern = word;
            }

            return false;
          });

          $textarea.remove();
          $phrase.val(pattern || codes.join(' '));

          if (submit)
          {
            $form.submit();
          }
          else
          {
            $form.find('.btn').focus();
          }
        }
      }

    },

    initialize: function()
    {
      var view = this;
      var tree = view.model;

      view.captureCopy = false;
      view.loadingFiles = false;

      view.listenTo(tree, 'change:searchPhrase change:selectedFolder', view.onFolderChange);
      view.listenTo(tree, 'change:markedFiles', view.onMarkedFilesChange);
      view.listenTo(tree.folders, 'reset add remove change:parent', view.updateFolderCount);
      view.listenTo(tree.files, 'request', view.onFilesRequest);
      view.listenTo(tree.files, 'sync', view.onFilesSync);
      view.listenTo(tree.files, 'reset add remove change:folders', view.updateFileCount);

      $(document).on('copy.' + view.idPrefix, view.onCopy.bind(view));
    },

    destroy: function()
    {
      $(document).off('.' + this.idPrefix);
    },

    afterRender: function()
    {
      this.toggleMarkedButtons();
    },

    getTemplateData: function()
    {
      return {
        displayMode: this.model.getDisplayMode(),
        searchPhrase: this.model.getSearchPhrase(),
        dateFilter: this.model.getDateFilter(),
        folderCount: this.serializeFolderCount(),
        fileCount: this.serializeFileCount(),
        markedFileCount: this.model.getMarkedFileCount()
      };
    },

    serializeFolderCount: function()
    {
      var tree = this.model;

      if (tree.hasSearchPhrase())
      {
        return 0;
      }

      var selectedFolder = tree.getSelectedFolder();

      if (tree.hasSelectedFolder())
      {
        return selectedFolder ? selectedFolder.get('children').length : 0;
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

    onFolderChange: function()
    {
      this.updateFolderCount();
      this.updateFileCount();
      this.updateSearchPhrase();
      this.toggleMarkedButtons();
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
      var tree = this.model;
      var selectedFolder = tree.getSelectedFolder();
      var disabled = !tree.getMarkedFileCount() || tree.hasSearchPhrase();
      var isTrash = selectedFolder && selectedFolder.id === '__TRASH__';

      this.$id('recoverMarkedFiles')
        .prop('disabled', disabled)
        .toggleClass('hidden', !isTrash);

      this.$id('unlinkMarkedFiles')
        .prop('disabled', disabled)
        .toggleClass('hidden', tree.isInTrash(selectedFolder));

      this.$id('removeMarkedFiles').prop('disabled', disabled);
      this.$id('editMarkedFiles').prop('disabled', disabled);
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
    }

  });
});
