// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/orderDocumentTree/templates/path',
  'app/orderDocumentTree/templates/folderSelector'
], function(
  _,
  $,
  View,
  template,
  renderFolderSelector
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .orderDocumentTree-path-label': function(e)
      {
        var parentFolderId = this.$(e.target).closest('.orderDocumentTree-path-item')[0].dataset.folderId;

        if (!parentFolderId)
        {
          return;
        }

        this.hideFolderSelector();

        this.model.setSelectedFolder(parentFolderId, {scroll: true});

        return false;
      },
      'click .orderDocumentTree-path-dropdown': function(e)
      {
        var parentFolderId = this.$(e.target).closest('.orderDocumentTree-path-item')[0].dataset.folderId;

        if (!parentFolderId)
        {
          return;
        }

        var childFolders = parentFolderId !== 'null'
          ? this.model.getChildFolders(this.model.folders.get(parentFolderId))
          : this.model.getRootFolders();

        if (childFolders.length === 1)
        {
          this.model.setSelectedFolder(childFolders[0].id, {scroll: true});
        }
        else
        {
          this.showFolderSelector(parentFolderId || null, childFolders, true);
        }

        return false;
      },
      'mouseenter .orderDocumentTree-path-item': function(e)
      {
        if (!this.$folderSelector)
        {
          return;
        }

        var parentFolderId = this.$(e.target).closest('.orderDocumentTree-path-item')[0].dataset.folderId;
        var childFolders = parentFolderId !== 'null'
          ? this.model.getChildFolders(this.model.folders.get(parentFolderId))
          : this.model.getRootFolders();

        this.showFolderSelector(parentFolderId || null, childFolders, false);
      }
    },

    initialize: function()
    {
      var view = this;
      var tree = view.model;

      view.$folderSelector = null;

      view.listenTo(tree, 'change:selectedFolder change:searchPhrase', this.render);
      view.listenTo(tree.folders, 'change:name change:parent', this.onFolderChange);

      $(window)
        .on('click.' + view.idPrefix, view.hideFolderSelector.bind(view))
        .on('resize.' + view.idPrefix, view.positionFolderSelector.bind(view, null));

      $('body').on('keydown.' + view.idPrefix, function(e)
      {
        if (e.keyCode === 27)
        {
          view.hideFolderSelector();
        }
      });
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
      $('body').off('.' + this.idPrefix);

      this.hideFolderSelector();
    },

    serialize: function()
    {
      return _.assign(View.prototype.serialize.apply(this, arguments), {
        searchPhrase: this.model.get('searchPhrase'),
        path: this.model.getPath().map(function(folder)
        {
          var label = folder.getLabel();

          if (label.indexOf(' ') === -1)
          {
            label = label.replace(/_/g, ' ');
          }

          return {
            id: folder.id,
            label: label,
            children: folder.hasAnyChildren()
          };
        })
      });
    },

    beforeRender: function()
    {
      this.hideFolderSelector();
    },

    afterRender: function()
    {

    },

    showFolderSelector: function(parentFolderId, folders, hide)
    {
      var view = this;

      if (view.$folderSelector && parentFolderId === view.$folderSelector.attr('data-parent-folder-id'))
      {
        if (hide)
        {
          view.hideFolderSelector();
        }

        return;
      }

      view.hideFolderSelector();

      view.$folderSelector = $(renderFolderSelector({
        parentFolderId: parentFolderId,
        folders: folders.map(function(folder)
        {
          return {
            id: folder.id,
            label: folder.getLabel()
          };
        })
      }));

      view.$folderSelector.on('click', '.orderDocumentTree-folderSelector-item', function(e)
      {
        view.model.setSelectedFolder(e.currentTarget.dataset.folderId, {scroll: true});
      });

      this.positionFolderSelector(folders.length ? 'visible' : 'hidden');

      view.$('.orderDocumentTree-path-item[data-folder-id="' + parentFolderId + '"]').addClass('is-selecting');

      view.$folderSelector.appendTo(document.body);
    },

    positionFolderSelector: function(visibility)
    {
      if (!this.$folderSelector)
      {
        return;
      }

      var parentFolderId = this.$folderSelector.attr('data-parent-folder-id');
      var $item = this.$('.orderDocumentTree-path-item[data-folder-id="' + parentFolderId + '"]');
      var rect = $item[0].getBoundingClientRect();

      this.$folderSelector.css({
        top: (rect.top + $item.outerHeight()) + 'px',
        right: (window.innerWidth - rect.right - 17) + 'px'
      });

      if (visibility)
      {
        this.$folderSelector.css('visibility', visibility);
      }
    },

    hideFolderSelector: function()
    {
      if (this.$folderSelector)
      {
        this.$('.is-selecting').removeClass('is-selecting');

        this.$folderSelector.remove();
        this.$folderSelector = null;
      }
    },

    onFolderChange: function(folder)
    {
      if (this.model.get('searchPhrase'))
      {
        return;
      }

      var $item = this.$('.orderDocumentTree-path-item[data-folder-id="' + folder.id + '"]');

      if ($item.length)
      {
        this.render();
      }
    }

  });
});
