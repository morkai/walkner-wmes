// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'form2js',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/orderDocumentTree/util/pasteDateEvents',
  'app/orderDocumentTree/templates/uploads',
  'app/orderDocumentTree/templates/upload'
], function(
  _,
  $,
  form2js,
  t,
  user,
  viewport,
  View,
  pasteDateEvents,
  template,
  renderUpload
) {
  'use strict';

  return View.extend({

    template: template,

    events: _.assign({
      'click button[data-action="remove"]': function(e)
      {
        var upload = this.model.uploads.get(this.$upload(e.target).attr('data-id'));

        if (upload)
        {
          this.model.uploads.remove(upload);
        }
      },
      'change .orderDocumentTree-uploads-field': function(e)
      {
        var upload = this.model.uploads.get(this.$upload(e.target).attr('data-id'));

        if (upload)
        {
          upload.set(e.target.name, e.target.value, {source: 'user'});
        }
      },
      'click #-setDate': function()
      {
        this.model.uploads.setDate(this.$id('date').val());
      },
      'click .orderDocumentTree-uploads-nc15[readonly]': function(e)
      {
        var documentFile = this.model.files.get(e.currentTarget.value);

        if (documentFile)
        {
          var uploadId = this.$upload(e.target)[0].dataset.id;
          var upload = this.model.uploads.get(uploadId);

          documentFile.trigger('focus', documentFile, upload.get('hash'));
        }
      },
      'submit': function(e)
      {
        e.preventDefault();

        var $setDate = this.$id('setDate').prop('disabled', true);
        var $submit = this.$id('submit').prop('disabled', true);

        var req = this.model.addFiles();

        viewport.msg.saving();

        req.fail(function()
        {
          viewport.msg.savingFailed();
        });

        req.done(function()
        {
          viewport.msg.saved();
        });

        req.always(function()
        {
          $setDate.prop('disabled', false);
          $submit.prop('disabled', false);
        });
      }
    }, pasteDateEvents),

    initialize: function()
    {
      var view = this;
      var tree = view.model;
      var handleDragEvent = view.onDrag.bind(view);

      view.uploadIndex = this.model.uploads.length;

      view.listenTo(tree.uploads, 'add', this.onAdd);
      view.listenTo(tree.uploads, 'remove', this.onRemove);
      view.listenTo(tree.uploads, 'focus', this.onFocus);
      view.listenTo(tree.uploads, 'upload:start', this.onUploadStart);
      view.listenTo(tree.uploads, 'change:date', this.onDateChange);
      view.listenTo(tree.uploads, 'change:name', this.onNameChange);
      view.listenTo(tree.uploads, 'change:error change:progress', this.onProgressChange);

      $(document)
        .on('dragenter.' + view.idPrefix, handleDragEvent)
        .on('dragleave.' + view.idPrefix, handleDragEvent)
        .on('dragover.' + view.idPrefix, handleDragEvent)
        .on('drop.' + view.idPrefix, view.onDrop.bind(view));
    },

    destroy: function()
    {
      $(document).off('.' + this.idPrefix);

      this.model.uploads.stopUploading();
    },

    serialize: function()
    {
      return _.assign(View.prototype.serialize.apply(this, arguments), {
        uploads: this.model.uploads.invoke('serializeDetails'),
        renderUpload: renderUpload
      });
    },

    $upload: function(id)
    {
      return typeof id === 'string'
        ? this.$('.orderDocumentTree-uploads-upload[data-id="' + id + '"]')
        : this.$(id).closest('.orderDocumentTree-uploads-upload');
    },

    onDrag: function(e)
    {
      e.preventDefault();
      e.stopPropagation();
    },

    onDrop: function(e)
    {
      e = e.originalEvent;

      if (!e.dataTransfer.files.length)
      {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (!user.isAllowedTo('DOCUMENTS:MANAGE'))
      {
        viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('orderDocumentTree', 'uploads:msg:notAllowed')
        });

        return;
      }

      var tree = this.model;
      var selectedFolder = tree.getSelectedFolder();

      if (!selectedFolder)
      {
        viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('orderDocumentTree', 'uploads:msg:noFolder')
        });

        return;
      }

      if (tree.isInTrash(selectedFolder))
      {
        viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('orderDocumentTree', 'uploads:msg:folderIsTrash')
        });

        return;
      }

      var uploads = tree.uploads;
      var files = e.dataTransfer.files;

      uploads.remove(
        uploads.filter(function(upload) { return upload.isError(); }),
        {animate: false}
      );

      for (var i = 0; i < files.length; ++i)
      {
        uploads.addFromFile(files[i], selectedFolder);
      }
    },

    onAdd: function(upload)
    {
      this.$id('uploads').append(renderUpload({
        upload: upload.serializeDetails(),
        i: this.uploadIndex++
      }));

      this.model.uploads.startUploading(this.promised.bind(this));

      clearTimeout(this.timers.fillNames);
      this.timers.fillNames = setTimeout(this.fillNames.bind(this), 1);

      this.onFocus(upload);
    },

    fillNames: function()
    {
      this.promised(this.model.uploads.fillNames());
    },

    onRemove: function(upload, uploads, options)
    {
      if (options && options.animate === false)
      {
        this.$upload(upload.id).remove();
      }
      else
      {
        this.$upload(upload.id).fadeOut('fast', function() { $(this).remove(); });
      }
    },

    onFocus: function(upload)
    {
      this.$upload(upload.id).find('input[name="date"]').focus();
    },

    onDateChange: function(upload, uploads, options)
    {
      if (options && options.source !== 'user')
      {
        this.$upload(upload.id).find('input[name="date"]').val(upload.get('date'));
      }
    },

    onNameChange: function(upload, uploads, options)
    {
      if (options && options.source !== 'user')
      {
        this.$upload(upload.id).find('input[name="name"]').val(upload.get('name'));
      }
    },

    onProgressChange: function(upload)
    {
      var $upload = this.$upload(upload.id);

      $upload
        .toggleClass('is-reuploadable', upload.isReuploadable())
        .find('.progress-bar')
        .prop('className', 'progress-bar progress-bar-' + upload.getStatusClassName())
        .css('width', upload.getProgress() + '%')
        .text(upload.getMessage());
    },

    onUploadStart: function(upload, xhr)
    {
      this.promised(xhr);
    }

  });
});
