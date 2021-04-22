// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/orderDocumentTree/OrderDocumentFolder',
  'app/orderDocumentTree/views/PathView',
  'app/orderDocumentTree/views/FoldersView',
  'app/orderDocumentTree/views/FilesView',
  'app/orderDocumentTree/views/UploadsView',
  'app/orderDocumentTree/views/ToolbarView',
  'app/orderDocumentTree/templates/page'
], function(
  _,
  $,
  t,
  user,
  viewport,
  View,
  bindLoadingMessage,
  OrderDocumentFolder,
  PathView,
  FoldersView,
  FilesView,
  UploadsView,
  ToolbarView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    layoutName: 'page',

    events: {
      'scroll #-folders': function()
      {
        return false;
      }
    },

    actions: function()
    {
      return [
        {
          label: this.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'DOCUMENTS:MANAGE',
          href: '#orders;settings?tab=documents'
        }
      ];
    },

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMB:base'),
        this.t('BREADCRUMB:root')
      ];
    },

    initialize: function()
    {
      var page = this;
      var tree = page.model;

      page.onResize = _.debounce(page.resize.bind(page), 20);
      page.$els = {
        foldersContainer: null,
        folders: null,
        filesContainer: null,
        files: null,
        uploadContainer: null
      };
      page.pathView = new PathView({model: tree});
      page.foldersView = new FoldersView({model: tree});
      page.toolbarView = new ToolbarView({model: tree});
      page.filesView = new FilesView({model: tree});
      page.uploadsView = new UploadsView({model: tree});

      var idPrefix = '#' + page.idPrefix + '-';

      page.setView(idPrefix + 'path', page.pathView);
      page.setView(idPrefix + 'folders', page.foldersView);
      page.setView(idPrefix + 'toolbar', page.toolbarView);
      page.setView(idPrefix + 'files', page.filesView);
      page.setView(idPrefix + 'uploadContainer', page.uploadsView);

      bindLoadingMessage(tree.folders, page, 'MSG:LOADING_FAILURE:folders');
      bindLoadingMessage(tree.files, page, 'MSG:LOADING_FAILURE:files');

      tree.subscribe(page.pubsub);

      page.listenTo(tree, 'change:selectedFolder change:searchPhrase', page.onSelectedChange.bind(page, true));
      page.listenTo(tree, 'change:selectedFile change:dateFilter', page.onSelectedChange.bind(page, false));
      page.listenTo(tree.files, 'remove', page.onFileRemove);
      page.listenTo(tree.folders, 'reset change:funcs', page.checkAccess);
      page.listenTo(tree.uploads, 'reset add remove', page.onUploadChange);

      $(window)
        .on('resize.' + page.idPrefix, page.onResize)
        .on('scroll.' + page.idPrefix, page.resize.bind(page));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    load: function(when)
    {
      var view = this;
      var tree = view.model;

      if (!tree.hasSelectedFile() || tree.hasSelectedFolder())
      {
        return when(
          tree.folders.fetch({reset: true}),
          tree.files.fetch({reset: true})
        );
      }

      var deferred = $.Deferred(); // eslint-disable-line new-cap
      var next = function()
      {
        $.when(tree.folders.fetch({reset: true}), tree.files.fetch({reset: true}))
          .fail(function() { deferred.reject(); })
          .done(function() { deferred.resolve(); });
      };

      view.ajax({url: '/orderDocuments/files/' + tree.get('selectedFile')})
        .fail(function()
        {
          viewport.msg.show({
            type: 'warning',
            time: 3000,
            text: view.t('MSG:fileNotFound', {nc15: tree.get('selectedFile')})
          });
        })
        .done(function(file)
        {
          tree.setSelectedFolder(file.folders[0], {keepFile: true});
        })
        .always(next);

      return when(deferred.promise());
    },

    getTemplateData: function()
    {
      return {
        uploading: this.model.uploads.length > 0
      };
    },

    afterRender: function()
    {
      var view = this;

      _.forEach(view.$els, function(v, k)
      {
        view.$els[k] = view.$id(k);
      });

      view.$els.folders.on('wheel', function(e)
      {
        if (view.foldersView.isContextMenuVisible())
        {
          return false;
        }

        if (e.originalEvent.deltaY < 0 && this.scrollTop === 0)
        {
          return false;
        }

        if (e.originalEvent.deltaY > 0 && this.scrollTop >= (this.scrollHeight - this.offsetHeight))
        {
          return false;
        }
      });

      view.$els.folders.on('scroll', function()
      {
        this.scrollLeft = 0;
      });

      this.resize();
    },

    resize: function()
    {
      var $filesContainer = this.$els.filesContainer;

      if (!$filesContainer || !$filesContainer.length)
      {
        return;
      }

      var top = Math.max(15, $filesContainer[0].offsetTop - window.scrollY);
      var height = window.innerHeight - 17 - top;

      this.$els.uploadContainer
        .css('top', top + 'px')
        .css('height', height + 'px');

      this.$els.foldersContainer
        .css('top', top + 'px');

      this.$els.folders
        .css('height', height + 'px');

      this.foldersView.hideContextMenu();
    },

    updateUrl: function(replace)
    {
      var url = '/orderDocuments/tree?';

      if (this.model.hasSelectedFolder())
      {
        url += 'folder=' + this.model.get('selectedFolder') + '&';
      }

      if (this.model.hasSelectedFile())
      {
        url += 'file=' + this.model.get('selectedFile') + '&';
      }

      if (this.model.hasSearchPhrase())
      {
        url += 'search=' + encodeURIComponent(this.model.get('searchPhrase')) + '&';
      }

      if (this.model.hasDateFilter())
      {
        url += 'date=' + this.model.getDateFilter() + '&';
      }

      this.broker.publish('router.navigate', {
        url: url,
        replace: replace,
        trigger: false
      });
    },

    checkAccess: function()
    {
      var selectedFolder = this.model.getSelectedFolder();

      if (!selectedFolder || this.model.canViewFolder(selectedFolder))
      {
        return;
      }

      setTimeout(this.model.setSelectedFolder.bind(this.model), 1, null);
    },

    onSelectedChange: function(resetFiles, model, newValue, options)
    {
      this.updateUrl(!(options && options.updateUrl));

      if (resetFiles)
      {
        this.promised(this.model.files.fetch({reset: true}));
      }
    },

    onFileRemove: function(file)
    {
      if (file.id === this.model.get('selectedFile'))
      {
        this.model.setSelectedFile(null);
      }
    },

    onUploadChange: function()
    {
      this.$el.toggleClass('is-uploading', this.model.uploads.length > 0);

      this.pathView.positionFolderSelector();
      this.foldersView.hideContextMenu();
      this.filesView.positionPreview();
    }

  });
});
