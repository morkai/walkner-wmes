// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/core/util/uuid',
  '../OrderDocumentFolder',
  './EditFolderDialogView',
  'app/orderDocumentTree/templates/folders',
  'app/orderDocumentTree/templates/folder',
  'app/orderDocumentTree/templates/foldersContextMenu',
  'app/orderDocumentTree/templates/purgeFolderDialog'
], function(
  _,
  $,
  t,
  user,
  viewport,
  View,
  DialogView,
  uuid,
  OrderDocumentFolder,
  EditFolderDialogView,
  template,
  renderFolder,
  renderContextMenu,
  purgeFolderDialogTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .orderDocumentTree-folders-toggle': function(e)
      {
        this.model.toggleFolder(
          this.$(e.target).closest('.orderDocumentTree-folders-folder')[0].dataset.folderId
        );

        return false;
      },
      'dblclick .orderDocumentTree-folders-toggle': function()
      {
        return false;
      },
      'click .orderDocumentTree-folders-item': function(e)
      {
        var $folder = this.$(e.target).closest('.orderDocumentTree-folders-folder');

        if ($folder.hasClass('is-editing'))
        {
          return;
        }

        var folderId = $folder[0].dataset.folderId;

        if (e.ctrlKey)
        {
          window.open('/#orderDocuments/tree?folder=' + folderId);

          return;
        }

        this.model.setSelectedFolder(folderId);
      },
      'dblclick .orderDocumentTree-folders-item': function(e)
      {
        this.model.toggleFolder(
          this.$(e.target).closest('.orderDocumentTree-folders-folder')[0].dataset.folderId
        );
      },
      'contextmenu': function(e)
      {
        var $target = this.$(e.target);
        var $folder = this.$(e.target).closest('.orderDocumentTree-folders-folder');

        if ($folder.hasClass('is-editing'))
        {
          return false;
        }

        var isLabel = $target.hasClass('orderDocumentTree-folders-label')
          || $target.parent().hasClass('orderDocumentTree-folders-label');
        var isSelected = $folder.hasClass('is-selected');
        var folderId = $folder.length && (isLabel || isSelected)
          ? $folder[0].dataset.folderId
          : null;

        if (folderId)
        {
          this.model.setSelectedFolder(folderId);
        }

        this.showContextMenu(folderId, e.clientX, e.clientY);

        return false;
      }
    },

    initialize: function()
    {
      var view = this;
      var tree = view.model;

      view.renderFolder = view.renderFolder.bind(view);

      view.listenTo(tree, 'change:selectedFolder', this.onSelectedChange);
      view.listenTo(tree, 'change:expandedFolders', this.onExpandedChange);
      view.listenTo(tree, 'change:cutFolder', this.onCutChange);
      view.listenTo(tree.folders, 'add', this.onAdd);
      view.listenTo(tree.folders, 'remove', this.onRemove);
      view.listenTo(tree.folders, 'change:parent', this.onParentChange);
      view.listenTo(tree.folders, 'change:name', this.onNameChange);
      view.listenTo(tree.folders, 'change:subdivisions', this.render);

      $(window).on('mousedown.' + view.idPrefix, view.hideContextMenu.bind(view));

      $('body').on('keydown.' + view.idPrefix, function(e)
      {
        if (e.keyCode === 27)
        {
          view.model.set('cutFolder', null);
          view.hideContextMenu();
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
        rootFolders: this.model.getRootFolders(),
        renderFolder: this.renderFolder
      });
    },

    renderFolder: function(folder, options)
    {
      var tree = this.model;

      return renderFolder({
        id: folder.id,
        label: folder.getLabel(),
        children: tree.getChildFolders(folder),
        expanded: tree.isFolderExpanded(folder.id),
        selected: tree.isFolderSelected(folder.id),
        cut: tree.isFolderCut(folder.id),
        isEditing: options && options.isEditing,
        isNew: options && options.isNew,
        renderFolder: this.renderFolder
      });
    },

    afterRender: function()
    {
      this.scrollIntoView();
    },

    $folder: function(folderId)
    {
      return this.$('.orderDocumentTree-folders-folder[data-folder-id="' + folderId + '"]');
    },

    $children: function(folderId)
    {
      return this.$folder(folderId).find('> .orderDocumentTree-folders-children');
    },

    scrollIntoView: function()
    {
      var selectedEl = this.$('.is-selected > .orderDocumentTree-folders-item')[0];

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
      }
    },

    isContextMenuVisible: function()
    {
      var $contextMenu = this.$id('contextMenu');

      return $contextMenu.length === 1 && !$contextMenu.hasClass('hidden');
    },

    showContextMenu: function(sourceFolderId, x, y)
    {
      var $contextMenu = this.$id('contextMenu');

      if (!$contextMenu.length)
      {
        $contextMenu = $('<div></div>')
          .attr('id', this.idPrefix + '-contextMenu')
          .addClass('orderDocumentTree-contextMenu hidden')
          .appendTo(document.body)
          .on('mousedown', function(e) { e.stopPropagation(); })
          .on('click', '.orderDocumentTree-contextMenu-item', this.onContextMenuItemClick.bind(this));
      }

      var tree = this.model;
      var sourceFolder = tree.folders.get(sourceFolderId) || null;
      var isRoot = !!sourceFolder && sourceFolder.isRoot();
      var cutFolder = tree.folders.get(this.model.get('cutFolder')) || null;
      var canManage = tree.canManageFolder(sourceFolder);
      var canEdit = canManage;

      if (canEdit && !user.isAllowedTo('DOCUMENTS:ALL') && (!sourceFolder || isRoot))
      {
        canEdit = false;
      }

      $contextMenu.html(this.renderPartialHtml(renderContextMenu, {
        canManage: canManage,
        canEdit: canEdit,
        isRoot: isRoot,
        isTrash: sourceFolder && sourceFolder.id === '__TRASH__',
        isInTrash: sourceFolder && tree.getRoot(sourceFolder).id === '__TRASH__',
        isRecoverable: sourceFolder && sourceFolder.isInTrash(),
        sourceFolder: !sourceFolder ? null : {
          id: sourceFolder.id,
          label: sourceFolder.getLabel(),
          expanded: tree.isFolderExpanded(sourceFolder.id)
        },
        cutFolder: !cutFolder || !tree.canMoveFolder(cutFolder, sourceFolder) ? null : {
          id: cutFolder.id,
          label: cutFolder.getLabel()
        }
      }));

      $contextMenu.css({
        top: '-1000px',
        left: x + 'px'
      });
      $contextMenu.removeClass('hidden');

      var height = $contextMenu.outerHeight();

      if (y + height + 15 > window.innerHeight)
      {
        y -= height;
      }

      $contextMenu.css('top', y + 'px');
    },

    hideContextMenu: function()
    {
      this.$id('contextMenu').addClass('hidden');
    },

    toggleChildren: function(folderId)
    {
      var $folder = this.$folder(folderId);

      if (!$folder.length)
      {
        return;
      }

      var $children = this.$children(folderId);

      $folder
        .removeClass('has-no-children has-children')
        .addClass($children.children().length ? 'has-children' : 'has-no-children');
    },

    $lastNonTrashFolder: function()
    {
      var $last = this.$id('root').children().last();

      if ($last.attr('data-folder-id') === '__TRASH__')
      {
        return $last.prev();
      }

      return $last;
    },

    onSelectedChange: function(tree, newValue, options)
    {
      var view = this;
      var selectedFolder = view.model.getSelectedFolder();

      view.$('.is-selected').removeClass('is-selected');

      if (selectedFolder)
      {
        view.$folder(selectedFolder.id).addClass('is-selected');

        if (options && options.scroll)
        {
          view.model.getPath().forEach(function(folder)
          {
            view.model.toggleFolder(folder.id, true);
          });

          view.scrollIntoView();
        }
      }
    },

    onExpandedChange: function(folderId, expanded)
    {
      if (folderId === null)
      {
        this.$('.orderDocumentTree-folders-folder').toggleClass('is-expanded', expanded);
      }
      else
      {
        this.$folder(folderId).toggleClass('is-expanded', expanded);
      }
    },

    onCutChange: function()
    {
      this.$('.is-cut').removeClass('is-cut');

      var cutFolderId = this.model.get('cutFolder');

      if (cutFolderId)
      {
        this.$folder(cutFolderId).addClass('is-cut');
      }
    },

    onAdd: function(folder)
    {
      if (this.$folder(folder.id).length)
      {
        return;
      }

      var $folder = $(this.renderFolder(folder));

      if (folder.isRoot())
      {
        var $parent = this.$lastNonTrashFolder();

        if ($parent.length)
        {
          $folder.insertAfter($parent);
        }
        else
        {
          this.$id('root').prepend($folder);
        }
      }
      else
      {
        this.$children(folder.get('parent')).append($folder);

        this.toggleChildren(folder.get('parent'));
      }
    },

    onRemove: function(folder)
    {
      this.$folder(folder.id).remove();

      this.toggleChildren(folder.get('parent'));
    },

    onParentChange: function(folder, newParentId, options)
    {
      var tree = this.model;
      var $folder = this.$folder(folder.id).detach();

      if (tree.isInTrash(folder) && !tree.canSeeTrash())
      {
        $folder.remove();

        this.toggleChildren(folder.get('parent'));

        if (options.oldParentId)
        {
          this.toggleChildren(options.oldParentId);
        }

        return;
      }

      if (folder.isRoot())
      {
        var $parent = this.$lastNonTrashFolder();

        if ($parent.length)
        {
          $folder.insertAfter($parent);
        }
        else
        {
          this.$id('root').prepend($folder);
        }
      }
      else
      {
        this.$children(folder.get('parent')).append($folder);

        this.toggleChildren(folder.get('parent'));
      }

      if (options.oldParentId)
      {
        this.toggleChildren(options.oldParentId);
      }

      if (folder === tree.getSelectedFolder())
      {
        this.onSelectedChange(tree, folder.id, {scroll: true});
      }
    },

    onNameChange: function(folder)
    {
      var $folder = this.$folder(folder.id);

      if ($folder.length)
      {
        $folder
          .find('> .orderDocumentTree-folders-item > .orderDocumentTree-folders-label > span')
          .text(folder.getLabel());
      }
    },

    onContextMenuItemClick: function(e)
    {
      this.hideContextMenu();

      var tree = this.model;
      var data = e.currentTarget.dataset;

      switch (data.action)
      {
        case 'expandFolder':
          tree.toggleFolder(data.folderId, true);
          break;

        case 'collapseFolder':
          tree.toggleFolder(data.folderId, false);
          break;

        case 'expandFolders':
          this.handleToggleFolders(data.folderId, true);
          break;

        case 'collapseFolders':
          this.handleToggleFolders(data.folderId, false);
          break;

        case 'newFolder':
          this.handleNewFolder(data.folderId);
          break;

        case 'cutFolder':
          tree.set('cutFolder', data.folderId);
          break;

        case 'moveFolder':
          this.handleMoveFolder(data.fromFolderId, data.toFolderId);
          break;

        case 'removeFolder':
          this.handleRemoveFolder(data.folderId);
          break;

        case 'renameFolder':
          this.handleRenameFolder(data.folderId);
          break;

        case 'editFolder':
          this.handleEditFolder(data.folderId);
          break;

        case 'recoverFolder':
          this.handleRecoverFolder(data.folderId);
          break;
      }
    },

    handleToggleFolders: function(folderId, expand)
    {
      var tree = this.model;

      if (!folderId)
      {
        tree.toggleFolder(null, expand);

        return;
      }

      var $folder = this.$folder(folderId);

      tree.toggleFolder(folderId, expand);

      $folder.find('.has-children').each(function()
      {
        tree.toggleFolder(this.dataset.folderId, expand);
      });
    },

    handleNewFolder: function(parentFolderId)
    {
      var view = this;
      var tree = view.model;
      var $parentFolder = view.$folder(parentFolderId);
      var newFolder = new OrderDocumentFolder({
        _id: uuid(),
        name: '',
        parent: parentFolderId,
        children: [],
        oldParent: null
      });
      var $newFolder = $(view.renderFolder(newFolder, {isEditing: true, isNew: true}));

      if ($parentFolder.length)
      {
        $parentFolder
          .removeClass('has-no-children')
          .addClass('has-children')
          .children('.orderDocumentTree-folders-children')
          .append($newFolder);

        view.model.toggleFolder(parentFolderId, true);
      }
      else
      {
        view.$id('root').append($newFolder);
      }

      var $editor = $newFolder.find('.orderDocumentTree-folders-editor');

      $editor.select().on('blur', save).on('keyup', function(e)
      {
        if (e.keyCode === 27)
        {
          return hide();
        }

        if (e.keyCode === 13)
        {
          return save();
        }
      });

      if ($editor[0].scrollIntoViewIfNeeded)
      {
        $editor[0].scrollIntoViewIfNeeded();
      }
      else
      {
        $editor[0].scrollIntoView();
      }

      function hide()
      {
        $newFolder.remove();
      }

      function save()
      {
        var name = $editor.val().trim();

        hide();

        if (!name.length)
        {
          return;
        }

        newFolder.set('name', name);

        tree.addFolder(newFolder).fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: view.t('folders:msg:addFolder:failure')
          });
        });
      }
    },

    handleMoveFolder: function(sourceFolderId, newParentFolderId)
    {
      var view = this;
      var tree = view.model;
      var sourceFolder = tree.folders.get(sourceFolderId);
      var newParentFolder = tree.folders.get(newParentFolderId) || null;

      tree.moveFolder(sourceFolder, newParentFolder).fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: view.t('folders:msg:moveFolder:failure')
        });
      });
    },

    handleRemoveFolder: function(folderId)
    {
      var view = this;
      var tree = view.model;
      var folder = tree.folders.get(folderId);

      if (!folder)
      {
        return;
      }

      if (tree.isInTrash(folder))
      {
        view.handlePurgeFolder(folder);
      }
      else
      {
        var $folder = view.$folder(folder.id).addClass('is-removed');

        this.model.removeFolder(folder)
          .fail(function()
          {
            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: view.t('folders:msg:removeFolder:failure')
            });
          })
          .always(function()
          {
            $folder.removeClass('is-removed');
          });
      }
    },

    handlePurgeFolder: function(folder)
    {
      var view = this;
      var tree = view.model;
      var isTrash = folder.id === '__TRASH__';
      var dialogView = new DialogView({
        template: purgeFolderDialogTemplate,
        autoHide: false,
        model: {
          isTrash: isTrash,
          label: folder.getLabel()
        }
      });

      view.listenTo(dialogView, 'answered', function()
      {
        var req = tree.purgeFolder(folder);

        req.fail(function()
        {
          dialogView.enableAnswers();

          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: view.t('purgeFolder:msg:failure' + (isTrash ? ':trash' : ''))
          });
        });

        req.done(function()
        {
          dialogView.closeDialog();

          viewport.msg.show({
            type: 'success',
            time: 2000,
            text: view.t('purgeFolder:msg:success' + (isTrash ? ':trash' : ''))
          });
        });
      });

      viewport.showDialog(dialogView, view.t('purgeFolder:title' + (isTrash ? ':trash' : '')));
    },

    handleRecoverFolder: function(folderId)
    {
      var view = this;

      view.tree.recoverFolder(view.tree.folders.get(folderId)).fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: view.t('folders:msg:recoverFolder:failure')
        });
      });
    },

    handleRenameFolder: function(folderId)
    {
      var view = this;
      var tree = view.model;
      var folder = tree.folders.get(folderId);
      var $folder = view.$folder(folderId);
      var $newFolder = $(view.renderFolder(folder, {isEditing: true, isNew: false}));

      $folder.replaceWith($newFolder);

      var $editor = $newFolder.find('.orderDocumentTree-folders-editor');

      $editor.select().on('blur', save).on('keyup', function(e)
      {
        if (e.keyCode === 27)
        {
          return hide();
        }

        if (e.keyCode === 13)
        {
          return save();
        }
      });

      function hide()
      {
        $newFolder.replaceWith(view.renderFolder(folder));
      }

      function save()
      {
        hide();

        var name = $editor.val().trim();

        if (!name.length)
        {
          return;
        }

        tree.renameFolder(folder, name).fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: view.t('folders:msg:renameFolder:failure')
          });
        });
      }
    },

    handleEditFolder: function(folderId)
    {
      var view = this;
      var tree = view.model;
      var folder = tree.folders.get(folderId);

      if (!folder)
      {
        return;
      }

      if (!folder.isRoot())
      {
        return view.handleRenameFolder(folderId);
      }

      var dialogView = new EditFolderDialogView({
        folder: folder,
        model: tree
      });

      viewport.showDialog(dialogView, view.t('editFolder:title'));
    }

  });
});
