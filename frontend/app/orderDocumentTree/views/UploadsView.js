// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'form2js',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/padString',
  '../util/pasteDateEvents',
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
  padString,
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
        var prop = e.target.name;
        var value = e.target.value;

        if (prop === 'nc15' && /^[0-9]{1,12}$/.test(value))
        {
          value = e.target.value = padString.start(value, 15, '0');
        }

        if (prop === 'nc15' && upload.get('error') === 'INVALID_DYNAMIC_NC15')
        {
          upload.set('error', null);
        }

        if (upload)
        {
          upload.set(prop, value, {source: 'user'});
        }
      },
      'input input[name="nc15"]': function(e)
      {
        var upload = this.model.uploads.get(this.$upload(e.target).attr('data-id'));

        if (upload && upload.get('error') === 'INVALID_DYNAMIC_NC15')
        {
          upload.set('error', null);
        }
      },
      'click #-setDate': function()
      {
        this.model.uploads.setDate(this.$id('date').val());
      },
      'click #-clear': function()
      {
        this.model.uploads.reset();
      },
      'click input[name="nc15"][readonly]': function(e)
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

        var view = this;
        var $setDate = view.$id('setDate').prop('disabled', true);
        var $submit = view.$id('submit').prop('disabled', true);

        var req = view.model.addFiles();

        viewport.msg.saving();

        req.fail(function()
        {
          var error = req.responseJSON && req.responseJSON.error || {};

          if (error.code !== 'INVALID_NC15')
          {
            viewport.msg.savingFailed();

            return;
          }

          viewport.msg.saved();

          error.invalidIds.forEach(function(nc15)
          {
            var upload = view.model.uploads.findWhere({nc15: nc15});

            if (upload)
            {
              upload.set('error', 'INVALID_DYNAMIC_NC15');
            }
          });
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

      view.listenTo(tree.uploads, 'reset', this.onReset);
      view.listenTo(tree.uploads, 'add', this.onAdd);
      view.listenTo(tree.uploads, 'remove', this.onRemove);
      view.listenTo(tree.uploads, 'focus', this.onFocus);
      view.listenTo(tree.uploads, 'upload:start', this.onUploadStart);
      view.listenTo(tree.uploads, 'change:nc15', this.onPropChange.bind(this, 'nc15'));
      view.listenTo(tree.uploads, 'change:date', this.onPropChange.bind(this, 'date'));
      view.listenTo(tree.uploads, 'change:name', this.onPropChange.bind(this, 'name'));
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

    getTemplateData: function()
    {
      return {
        uploads: this.model.uploads.invoke('serializeDetails'),
        renderUpload: this.renderPartialHtml.bind(this, renderUpload)
      };
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
          text: this.t('uploads:msg:notAllowed')
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
          text: this.t('uploads:msg:noFolder')
        });

        return;
      }

      if (tree.isInTrash(selectedFolder))
      {
        viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: this.t('uploads:msg:folderIsTrash')
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

    onReset: function()
    {
      var view = this;

      view.model.uploads.stopUploading();

      view.$id('uploads').html('');

      view.model.uploads.forEach(function(upload)
      {
        view.addUpload(upload);
      });
    },

    onAdd: function(upload)
    {
      this.$id('uploads').append(this.renderPartialHtml(renderUpload, {
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

    onPropChange: function(prop, upload, uploads, options)
    {
      if (options && options.source !== 'user')
      {
        this.$upload(upload.id).find('input[name="' + prop + '"]').val(upload.get(prop)).trigger('change');
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
