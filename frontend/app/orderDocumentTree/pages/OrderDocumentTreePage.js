// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/orderDocumentTree/views/PathView',
  'app/orderDocumentTree/views/FoldersView',
  'app/orderDocumentTree/views/FilesView',
  'app/orderDocumentTree/views/UploadsView',
  'app/orderDocumentTree/templates/page',
  'app/orderDocumentTree/templates/searchAction',
  'app/orderDocumentTree/templates/displayModeAction'
], function(
  _,
  $,
  t,
  user,
  viewport,
  View,
  bindLoadingMessage,
  PathView,
  FoldersView,
  FilesView,
  UploadsView,
  template,
  searchActionTemplate,
  displayModeActionTemplate
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
      var view = this;

      return [
        {
          template: function()
          {
            return searchActionTemplate({
              idPrefix: view.idPrefix
            });
          },
          afterRender: function($action)
          {
            $action
              .find('form')
              .on('submit', view.onSearchFormSubmit.bind(view))
              .find('input[name="searchPhrase"]')
              .val(view.model.get('searchPhrase'))
              .on('keydown', view.onSearchPhraseKeyDown.bind(view));
          }
        },
        {
          template: function()
          {
            return displayModeActionTemplate({
              displayMode: view.model.getDisplayMode()
            });
          },
          afterRender: function($action)
          {
            $action.on('change', '.btn', function()
            {
              view.model.setDisplayMode($action.find('input:checked').val());
            });
          }
        },
        {
          label: t.bound('orderDocumentTree', 'PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'DOCUMENTS:MANAGE',
          href: '#orders;settings?tab=documents'
        }
      ];
    },

    breadcrumbs: function()
    {
      return [
        t('orderDocumentTree', 'BREADCRUMBS:base'),
        t('orderDocumentTree', 'BREADCRUMBS:root')
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
      page.filesView = new FilesView({model: tree});
      page.uploadsView = new UploadsView({model: tree});

      page.setView('#' + page.idPrefix + '-path', page.pathView);
      page.setView('#' + page.idPrefix + '-folders', page.foldersView);
      page.setView('#' + page.idPrefix + '-files', page.filesView);
      page.setView('#' + page.idPrefix + '-uploadContainer', page.uploadsView);

      bindLoadingMessage(tree.folders, page, 'MSG:LOADING_FAILURE:folders');
      bindLoadingMessage(tree.files, page, 'MSG:LOADING_FAILURE:files');

      tree.subscribe(page.pubsub);

      page.listenTo(tree, 'change:selectedFolder change:searchPhrase', page.onSelectedChange.bind(page, true));
      page.listenTo(tree, 'change:selectedFile', page.onSelectedChange.bind(page, false));
      page.listenTo(tree.files, 'remove', page.onFileRemove);
      page.listenTo(tree.uploads, 'add remove', page.onUploadChange);

      $(window)
        .on('resize.' + page.idPrefix, page.onResize)
        .on('scroll.' + page.idPrefix, page.resize.bind(page));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      this.$els = null;
    },

    load: function(when)
    {
      var tree = this.model;

      if (!tree.hasSelectedFile() || tree.hasSelectedFolder())
      {
        return when(
          tree.folders.fetch({reset: true}),
          tree.files.fetch({reset: true})
        );
      }

      var deferred = $.Deferred();
      var next = function()
      {
        $.when(tree.folders.fetch({reset: true}), tree.files.fetch({reset: true}))
          .fail(function() { deferred.reject(); })
          .done(function() { deferred.resolve(); });
      };

      this.ajax({url: '/orderDocuments/files/' + tree.get('selectedFile')})
        .fail(function()
        {
          viewport.msg.show({
            type: 'warning',
            time: 3000,
            text: t('orderDocumentTree', 'MSG:fileNotFound', {nc15: tree.get('selectedFile')})
          });
        })
        .done(function(file)
        {
          tree.setSelectedFolder(file.folders[0], {keepFile: true});
        })
        .always(next);

      return when(deferred.promise());
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
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
      var top = Math.max(15, this.$els.filesContainer[0].offsetTop - window.scrollY);
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

    updateUrl: function()
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

      this.broker.publish('router.navigate', {
        url: url,
        replace: true,
        trigger: false
      });
    },

    onSelectedChange: function(resetFiles)
    {
      this.updateUrl();

      this.$id('searchPhrase').val(this.model.get('searchPhrase'));

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
    },

    onSearchFormSubmit: function()
    {
      this.model.setSearchPhrase(this.$id('searchPhrase').val());

      return false;
    },

    onSearchPhraseKeyDown: function(e)
    {
      if (e.keyCode === 27)
      {
        this.model.setSearchPhrase('');

        return false;
      }
    }

  });
});
