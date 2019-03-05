// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/user',
  'app/core/View',
  'app/core/views/DialogView',
  'app/orderDocumentTree/OrderDocumentTree',
  'app/orderDocumentTree/views/EditFileDialogView',
  'app/orderDocumentTree/templates/files',
  'app/orderDocumentTree/templates/filesFile',
  'app/orderDocumentTree/templates/filesFolder',
  'app/orderDocumentTree/templates/removeFileDialog',
  'app/orderDocumentTree/templates/recoverFileDialog'
], function(
  _,
  $,
  t,
  time,
  viewport,
  user,
  View,
  DialogView,
  OrderDocumentTree,
  EditFileDialogView,
  template,
  renderFile,
  renderFolder,
  removeFileDialogTemplate,
  recoverFileDialogTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .orderDocumentTree-files-folder': function(e)
      {
        if (window.getSelection().toString() !== '')
        {
          return false;
        }

        this.model.setSelectedFolder(e.currentTarget.dataset.id, {
          scroll: true,
          keepFile: false
        });
      },
      'mouseup a[data-hash]': function(e)
      {
        if (!e.altKey)
        {
          return;
        }

        this.addUpload(
          e.currentTarget.dataset.fileId,
          e.currentTarget.dataset.hash
        );

        e.target.blur();

        return false;
      },
      'click a[data-hash]': function(e)
      {
        if (e.altKey)
        {
          return false;
        }
      },
      'click .orderDocumentTree-files-file': function(e)
      {
        if (e.target.tagName === 'A' || window.getSelection().toString() !== '')
        {
          return;
        }

        var tree = this.model;
        var documentFile = tree.files.get(e.currentTarget.dataset.id);

        if (e.altKey)
        {
          this.addUpload(documentFile.id, null);

          return false;
        }

        if (e.ctrlKey)
        {
          this.toggleMarkFile(documentFile);

          return;
        }

        this.lastClickEvent = e;

        tree.setSelectedFile(documentFile.id);

        return false;
      },
      'click #-closePreview': function()
      {
        this.model.setSelectedFile(null);
      },
      'dblclick #-preview': function(e)
      {
        if (!this.$(e.target).closest('.btn').length)
        {
          this.model.setSelectedFile(null);
        }
      },
      'click a[data-folder-id]': function(e)
      {
        this.model.setSelectedFolder(e.target.dataset.folderId, {
          scroll: true,
          keepFile: true
        });

        return false;
      },
      'click #-editFile': function()
      {
        var dialogView = new EditFileDialogView({
          model: this.model.getSelectedFile(),
          tree: this.model,
          done: function() { viewport.closeDialog(); }
        });

        viewport.showDialog(dialogView, this.t('editFile:title'));
      },
      'click #-removeFile': function()
      {
        var view = this;
        var tree = view.model;
        var selectedFolder = tree.getSelectedFolder();
        var selectedFile = tree.getSelectedFile();
        var isInTrash = tree.isInTrash(selectedFolder);
        var dialogView = new DialogView({
          template: removeFileDialogTemplate,
          autoHide: false,
          model: {
            nc15: selectedFile.id,
            multiple: selectedFile.get('folders').length > 1,
            purge: isInTrash
          }
        });

        view.listenTo(dialogView, 'answered', function(answer)
        {
          var req = answer === 'purge'
            ? tree.purgeFile(selectedFile)
            : answer === 'remove'
              ? tree.removeFile(selectedFile)
              : tree.unlinkFile(selectedFile, selectedFolder);

          req.fail(function()
          {
            dialogView.enableAnswers();

            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: view.t('removeFile:msg:failure')
            });
          });

          req.done(function()
          {
            dialogView.closeDialog();

            viewport.msg.show({
              type: 'success',
              time: 3000,
              text: view.t('removeFile:msg:success')
            });
          });
        });

        viewport.showDialog(dialogView, view.t('removeFile:title'));
      },
      'click #-recoverFile': function()
      {
        var view = this;
        var selectedFile = view.model.getSelectedFile();
        var dialogView = new DialogView({
          template: recoverFileDialogTemplate,
          autoHide: false,
          model: {
            nc15: selectedFile.id
          }
        });

        view.listenTo(dialogView, 'answered', function(answer)
        {
          if (answer !== 'yes')
          {
            dialogView.closeDialog();

            return;
          }

          var req = this.model.recoverFile(selectedFile);

          req.fail(function()
          {
            dialogView.enableAnswers();

            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: view.t('recoverFile:msg:failure')
            });
          });

          req.done(function()
          {
            dialogView.closeDialog();

            viewport.msg.show({
              type: 'success',
              time: 3000,
              text: view.t('recoverFile:msg:success')
            });
          });
        });

        viewport.showDialog(dialogView, view.t('recoverFile:title'));
      },
      'click #-subFile': function()
      {
        var view = this;
        var target = view.model.get('selectedFile');
        var req = $.ajax({
          method: 'POST',
          url: '/subscriptions/orderDocumentTree/' + target
        });

        view.$id('subFile')
          .prop('disabled', true)
          .attr('title', '')
          .find('.fa')
          .attr('class', 'fa fa-spinner fa-spin');

        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 2500,
            text: view.t('files:sub:failure')
          });

          if (target === view.model.get('selectedFile'))
          {
            view.resolveFileSub();
          }
        });
      }
    },

    remoteTopics: {

      'subscriptions.*': function(message, topic)
      {
        var sub = message.model;

        if (sub.type !== 'orderDocumentTree' || sub.user !== user.data._id)
        {
          return;
        }

        if (/added|edited/.test(topic))
        {
          this.toggleFileSub(sub.target, sub);
        }
        else if (/deleted/.test(topic))
        {
          this.toggleFileSub(sub.target, null);
        }
      }

    },

    initialize: function()
    {
      var view = this;
      var tree = view.model;

      view.serializeFolder = view.serializeFolder.bind(view);
      view.serializeFile = view.serializeFile.bind(view);

      view.listenTo(tree, 'change:displayMode', view.onDisplayModeChange);
      view.listenTo(tree, 'change:selectedFolder change:searchPhrase', view.render);
      view.listenTo(tree, 'change:selectedFile', view.onSelectedFileChange);
      view.listenTo(tree, 'change:markedFiles', view.onMarkedFilesChange);
      view.listenTo(tree, 'change:dateFilter', view.onDateFilterChange);
      view.listenTo(tree.files, 'request', view.onFilesRequest);
      view.listenTo(tree.files, 'error', view.onFilesError);
      view.listenTo(tree.files, 'reset', view.onFilesReset);
      view.listenTo(tree.files, 'remove', view.onFilesRemove);
      view.listenTo(tree.files, 'add', view.onFilesAdd);
      view.listenTo(tree.files, 'change', view.onFilesChange);
      view.listenTo(tree.files, 'focus', view.onFilesFocus);
      view.listenTo(tree.folders, 'add', view.onFoldersAdd);
      view.listenTo(tree.folders, 'remove', view.onFoldersRemove);
      view.listenTo(tree.folders, 'change:parent', view.onParentChange);

      $(window).on('resize.' + view.idPrefix, view.positionPreview.bind(view));

      $('body').on('keydown.' + view.idPrefix, function(e)
      {
        if (e.keyCode === 27)
        {
          tree.setSelectedFile(null);
        }
      });
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
      $('body').off('.' + this.idPrefix);
    },

    serialize: function()
    {
      return _.assign(View.prototype.serialize.apply(this, arguments), {
        displayMode: this.model.getDisplayMode(),
        searchPhrase: this.model.getSearchPhrase(),
        folders: this.serializeFolders(),
        files: this.serializeFiles()
      });
    },

    serializeMoreFiles: function()
    {
      var files = this.model.files;

      return files.length > 0 && files.totalCount > files.length ? (files.totalCount - files.length) : 0;
    },

    serializeFolders: function()
    {
      return this.model.hasSearchPhrase()
        ? []
        : this.model.getChildFolders(this.model.getSelectedFolder()).map(this.serializeFolder);
    },

    serializeFolder: function(folder)
    {
      return {
        id: folder.id,
        label: folder.getLabel().replace(/_/g, ' '),
        icon: folder.id === '__TRASH__' ? 'fa-trash-o' : 'fa-folder-o'
      };
    },

    serializeFiles: function()
    {
      var dateFilter = this.model.getDateFilter();
      var filterFile = function() { return true; };

      if (dateFilter)
      {
        dateFilter += 'T00:00:00.000Z';
        filterFile = function(file)
        {
          var files = file.get('files');

          for (var i = 0; i < files.length; ++i)
          {
            if (files[i].date === dateFilter)
            {
              return true;
            }
          }

          return false;
        };
      }

      var files = this.model.files.filter(filterFile).map(this.serializeFile);
      var moreFiles = this.serializeMoreFiles();

      if (moreFiles)
      {
        files.push({
          id: null,
          text: '+' + moreFiles,
          smallText: '',
          selected: false,
          icon: 'fa-files-o'
        });
      }

      return files;
    },

    serializeFile: function(file)
    {
      var label = file.getLabel();

      if (label === file.id)
      {
        label = '';
      }

      var marked = this.model.isMarkedFile(file);

      return {
        id: file.id,
        text: file.id,
        smallText: label.replace(/_/g, ' '),
        selected: file.id === this.model.get('selectedFile'),
        marked: marked,
        icon: 'fa-file-o',
        files: file.get('files')
      };
    },

    beforeRender: function()
    {
      this.lastClickEvent = null;
    },

    afterRender: function()
    {
      this.showPreviewIfNeeded();
    },

    addUpload: function(fileId, hash)
    {
      var tree = this.model;
      var selectedFolder = tree.getSelectedFolder();

      if (tree.isInTrash(selectedFolder))
      {
        return;
      }

      var documentFile = tree.files.get(fileId);

      var documentFolder = tree.hasSearchPhrase()
        ? tree.folders.get(documentFile.get('folders')[0])
        : selectedFolder;

      this.model.uploads.addFromDocument(documentFile, documentFolder, hash);
    },

    toggleMarkFile: function(file)
    {
      if (!this.model.hasSearchPhrase() || file.get('folders').length === 1)
      {
        this.model.toggleMarkFile(file);

        return;
      }

      viewport.msg.show({
        type: 'warning',
        time: 3000,
        text: this.t('MSG:canNotMarkSearchResult')
      });
    },

    showPreviewIfNeeded: function()
    {
      var selectedEl = this.$('.is-selected')[0];

      if (selectedEl)
      {
        if (selectedEl.scrollIntoViewIfNeeded)
        {
          selectedEl.scrollIntoViewIfNeeded();
        }
        else
        {
          selectedEl.scrollIntoView();
        }

        this.showPreview();
      }
      else
      {
        this.hidePreview();
      }
    },

    showPreview: function()
    {
      var $preview = this.$id('preview');
      var props = this.serializePreview();

      _.forEach(props, function(html, prop)
      {
        $preview.find('dd[data-prop="' + prop + '"]').html(html);
      });

      var tree = this.model;
      var selectedFolder = tree.getSelectedFolder();
      var isTrash = selectedFolder && selectedFolder.id === '__TRASH__';
      var isInTrash = tree.isInTrash(selectedFolder);

      $preview
        .css({
          top: '-1000px',
          left: '-1000px'
        })
        .toggleClass('is-trash', isTrash)
        .toggleClass('is-in-trash', isInTrash)
        .removeClass('hidden');

      this.$id('subFile')
        .prop('disabled', true)
        .removeClass('hidden')
        .attr('title', '')
        .find('.fa')
        .attr('class', 'fa fa-spinner fa-spin');

      this.resolveFileSub();
      this.positionPreview();
    },

    serializePreview: function()
    {
      var selectedFile = this.model.getSelectedFile();

      return {
        nc15: _.escape(selectedFile.id),
        name: _.escape(selectedFile.getLabel()),
        folders: this.serializePreviewFolders(),
        files: this.serializePreviewFiles()
      };
    },

    serializePreviewFolders: function()
    {
      var tree = this.model;
      var selectedFolder = tree.getSelectedFolder();
      var selectedFile = tree.getSelectedFile();
      var html = '';
      var canSeeTrash = tree.canSeeTrash();

      _.forEach(selectedFile.get('folders'), function(folderId)
      {
        var folder = tree.folders.get(folderId);

        if (!folder)
        {
          return;
        }

        var path = tree.getPath(folder);
        var root = path[0];
        var isInTrash = root.id === '__TRASH__';

        if (isInTrash && !canSeeTrash)
        {
          return;
        }

        path = path
          .map(function(folder) { return folder.getLabel(); })
          .join(' > ');

        html += '<li title="' + _.escape(path) + '">';

        if (folder === selectedFolder)
        {
          html += '<span style="text-decoration: ' + (isInTrash ? 'line-through' : 'none') + '">'
            + _.escape(folder.getLabel())
            + '</span>';
        }
        else
        {
          html += '<a href="#orderDocuments/tree?folder=' + folder.id + '&file=' + selectedFile.id + '"'
            + ' data-folder-id="' + folder.id + '"'
            + ' style="text-decoration: ' + (isInTrash ? 'line-through' : 'none') + '">'
            + _.escape(folder.getLabel())
            + '</a>';
        }
      });

      if (html)
      {
        return '<ul>' + html + '</ul>';
      }

      return '-';
    },

    serializePreviewFiles: function()
    {
      var view = this;
      var selectedFile = view.model.getSelectedFile();
      var html = '';

      _.forEach(selectedFile.get('files'), function(file)
      {
        html += '<li><a href="/orderDocuments/' + selectedFile.id + '?pdf=1&hash=' + file.hash + '" target="_blank"'
          + ' data-file-id="' + selectedFile.id + '" data-hash="' + file.hash + '">'
          + view.t('files:files:date', {date: time.utc.format(file.date, 'LL')})
          + '</a>';
      });

      if (html)
      {
        return '<ul>' + html + '</ul>';
      }

      return '-';
    },

    positionPreview: function()
    {
      var $selected = this.$('.is-selected');

      if (!$selected.length)
      {
        return;
      }

      var $preview = this.$id('preview').css({
        top: '-1000px',
        left: '-1000px'
      });
      var previewWidth = $preview.outerWidth();
      var previewHeight = $preview.outerHeight();
      var listDisplayMode = this.model.getDisplayMode() === OrderDocumentTree.DISPLAY_MODE.LIST;
      var top;
      var left;

      if (listDisplayMode && this.lastClickEvent)
      {
        top = this.lastClickEvent.pageY;
        left = this.lastClickEvent.pageX;

        if (left + previewWidth + 15 >= window.innerWidth)
        {
          left = window.innerWidth - previewWidth - 30;
        }

        if (this.lastClickEvent.clientY + previewHeight + 15 >= window.innerHeight)
        {
          top -= previewHeight;
        }
      }
      else
      {
        var offset = $selected.offset();
        var itemWidth = 200;
        var overflowX = offset.left + previewWidth + 15 > window.innerWidth;
        var right = offset.left + itemWidth;

        left = overflowX ? (right - previewWidth) : offset.left;
        top = offset.top;

        if (listDisplayMode)
        {
          top += 14;
          left += 14;
        }
      }

      this.$id('preview').css({
        top: top + 'px',
        left: left + 'px'
      });
    },

    hidePreview: function()
    {
      this.$id('preview').addClass('hidden');

      if (this.fileSubReq)
      {
        this.fileSubReq.abort();
        this.fileSubReq = null;
      }
    },

    resolveFileSub: function()
    {
      var view = this;
      var selectedFile = view.model.getSelectedFile();

      if (!selectedFile)
      {
        return;
      }

      var target = selectedFile.id;
      var req = view.fileSubReq = view.ajax({
        method: 'GET',
        url: '/subscriptions/orderDocumentTree/' + target
      });

      req.fail(function()
      {
        if (target !== view.model.getSelectedFile().id)
        {
          return;
        }

        view.$id('subFile').addClass('hidden');
      });

      req.done(function(res)
      {
        view.toggleFileSub(target, res.subscription);
      });

      req.always(function()
      {
        view.fileSubReq = null;
      });
    },

    toggleFileSub: function(target, subscription)
    {
      if (target !== this.model.getSelectedFile().id)
      {
        return;
      }

      var active = false;

      if (subscription)
      {
        if (target !== subscription.target)
        {
          return;
        }

        active = true;
      }

      this.$id('subFile')
        .prop('disabled', false)
        .removeClass('hidden')
        .toggleClass('active', active)
        .attr('title', this.t('files:sub:' + active))
        .find('.fa')
        .attr('class', 'fa fa-eye');
    },

    showEmptyIfNeeded: function()
    {
      if (!this.$id('folders').children().length && !this.$id('files').children().length)
      {
        this.$id('files').html('<p>'
          + this.t('files:' + (this.model.hasSearchPhrase() ? 'noResults' : 'empty'))
          + '</p>');
      }
    },

    addFile: function(file)
    {
      if (this.model.hasSearchPhrase())
      {
        return;
      }

      this.$id('files').find('> p').remove();

      this.$id('files').append(renderFile({
        file: this.serializeFile(file)
      }));
    },

    removeFile: function(file)
    {
      var $file = this.$file(file.id);

      if (!$file.length)
      {
        return;
      }

      if ($file.hasClass('is-selected'))
      {
        this.hidePreview();
      }

      $file.remove();

      this.showEmptyIfNeeded();
    },

    updateFile: function(file)
    {
      var $file = this.$file(file.id);

      if (!$file.length)
      {
        this.addFile(file);

        return;
      }

      $file.replaceWith(renderFile({
        file: this.serializeFile(file)
      }));

      if (file === this.model.getSelectedFile())
      {
        this.showPreview();
      }
    },

    $folder: function(id)
    {
      return this.$id('folders').find('.orderDocumentTree-files-item[data-id="' + id + '"]');
    },

    $file: function(id)
    {
      return this.$id('files').find('.orderDocumentTree-files-item[data-id="' + id + '"]');
    },

    onSelectedFileChange: function()
    {
      var selectedFile = this.model.getSelectedFile();

      this.$id('files').find('.is-selected').removeClass('is-selected');

      if (selectedFile)
      {
        this.$id('files')
          .find('.orderDocumentTree-files-item[data-id="' + selectedFile.id + '"]')
          .addClass('is-selected');

        this.showPreview();
      }
      else
      {
        this.hidePreview();
      }
    },

    onMarkedFilesChange: function(tree, file, state)
    {
      this.$file(file.id).toggleClass('is-marked', state);
    },

    onDateFilterChange: function()
    {
      this.render();
    },

    onFilesRequest: function()
    {
      this.hidePreview();

      if (this.$('.orderDocumentTree-files-folder').length === 0)
      {
        this.$id('files').html('<p><i class="fa fa-spinner fa-spin fa-3x"></i></p>');
      }
    },

    onFilesError: function()
    {
      this.$id('files').find('.fa').css('color', 'red');
    },

    onFilesReset: function()
    {
      var html = '';
      var files = this.serializeFiles();

      if (files.length === 0 && this.$('.orderDocumentTree-files-folder').length === 0)
      {
        html = '<p>'
          + this.t('files:' + (this.model.hasSearchPhrase() ? 'noResults' : 'empty'))
          + '</p>';
      }
      else
      {
        files.forEach(function(file)
        {
          html += renderFile({file: file});
        });
      }

      this.$id('files').html(html);

      this.showPreviewIfNeeded();
    },

    onFilesAdd: function(file)
    {
      this.addFile(file);
    },

    onFilesRemove: function(file)
    {
      this.removeFile(file);
    },

    onFilesChange: function(file)
    {
      if (file.isInFolder(this.model.get('selectedFolder')))
      {
        this.updateFile(file);
      }
      else if (this.$file(file.id).length)
      {
        this.removeFile(file);
      }
    },

    onFilesFocus: function(file, hash)
    {
      var selector = 'a[data-hash="' + hash + '"]';

      if (this.model.getSelectedFile() === file)
      {
        this.$id('preview').find(selector).focus();

        return;
      }

      var $a = this.$file(file.id).find(selector);

      if ($a.length)
      {
        $a.focus();

        return;
      }

      this.model.setSelectedFile(file.id);

      this.$id('preview').find(selector).focus();
    },

    onFoldersAdd: function(folder)
    {
      if (this.model.hasSearchPhrase())
      {
        return;
      }

      this.$id('folders').append(renderFolder({
        folder: this.serializeFolder(folder)
      }));
    },

    onFoldersRemove: function(folder)
    {
      this.$folder(folder.id).remove();

      this.showEmptyIfNeeded();
    },

    onParentChange: function(folder)
    {
      var $folder = this.$folder(folder.id);

      if ($folder.length && folder.get('parent') !== this.model.get('selectedFolder'))
      {
        $folder.remove();
      }
    },

    onDisplayModeChange: function()
    {
      this.$el
        .removeClass(_.values(OrderDocumentTree.DISPLAY_MODE).map(function(d) { return 'is-' + d; }).join(' '))
        .addClass('is-' + this.model.getDisplayMode());

      this.positionPreview();
    }

  });
});
