// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/uuid',
  'app/planning/util/contextMenu',
  'app/wmes-fap-entries/templates/attachments',
  'app/wmes-fap-entries/templates/attachment'
], function(
  _,
  $,
  user,
  viewport,
  View,
  uuid,
  contextMenu,
  template,
  attachmentTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'mouseenter .fap-attachment[data-preview="1"]': function(e)
      {
        this.showPreview(e.currentTarget.dataset.attachmentId);
      },
      'mouseleave .fap-attachment': function()
      {
        this.hidePreview();
      },
      'mouseleave': function()
      {
        this.hidePreview();
      },
      'click [data-action="removeUpload"]': function(e)
      {
        var $attachment = this.$(e.target).closest('.fap-attachment');
        var attachmentId = $attachment[0].dataset.attachmentId;
        var entry = this.model;

        if (entry.uploading && entry.uploading.upload._id === attachmentId)
        {
          entry.uploading.abort();
          entry.uploading = null;
        }
        else
        {
          entry.uploadQueue = entry.uploadQueue.filter(function(upload) { return upload._id !== attachmentId; });
          entry.uploadedFiles = entry.uploadedFiles.filter(function(upload) { return upload._id !== attachmentId; });
        }

        this.removeAttachment(attachmentId);

        return false;
      },
      'click [data-action="showMenu"]': function(e)
      {
        var $attachment = this.$(e.target).closest('.fap-attachment');
        var attachment = this.findAttachment($attachment[0].dataset.attachmentId);
        var menu = [
          {
            icon: 'fa-edit',
            label: this.t('attachments:menu:rename'),
            handler: this.handleRenameAttachment.bind(this, attachment._id)
          }
        ];

        if (user.isAllowedTo('FAP:MANAGE') || (attachment.user && attachment.user.id === user.data._id))
        {
          menu.push({
            icon: 'fa-times',
            label: this.t('attachments:menu:remove'),
            handler: this.handleRemoveAttachment.bind(this, attachment._id)
          });
        }

        contextMenu.show(this, e.pageY, e.pageX, menu);

        return false;
      },
      'click #-upload': function()
      {
        this.$id('files').click();
      },
      'change #-files': function(e)
      {
        if (e.target.files.length)
        {
          this.upload(e.target.files);
        }
      }

    },

    initialize: function()
    {
      var view = this;
      var entry = view.model;

      if (!entry.uploadQueue)
      {
        entry.uploadQueue = [];
        entry.uploading = null;
        entry.uploadedFiles = [];
      }

      view.listenTo(entry, 'focusAttachment', view.focusAttachment);
      view.listenTo(entry, 'change:attachments', _.debounce(view.renderAttachments.bind(view), 1));

      $(window)
        .on('keydown.' + view.idPrefix, view.onKeyDown.bind(view))
        .on('paste.' + view.idPrefix, view.onPaste.bind(view));
    },

    destroy: function()
    {
      $(document.body).off('.' + this.idPrefix);
      $(window).off('.' + this.idPrefix);
    },

    afterRender: function()
    {
      this.$('.fap-details-panel-bd').on('scroll', this.hideEditor.bind(this));

      this.$id('upload').toggleClass('hidden', !this.model.serializeDetails().auth.attachments);

      this.setUpDnd();
      this.renderAttachments();
    },

    setUpDnd: function()
    {
      var view = this;
      var dragEvents = 'drag dragstart dragend dragover dragenter dragleave drop'
        .split(' ')
        .map(function(e) { return e + '.' + view.idPrefix; })
        .join(' ');

      $(document.body)
        .on(dragEvents, view.onDrag.bind(view))
        .on('drop.' + view.idPrefix, view.onDrop.bind(view));
    },

    renderAttachments: function()
    {
      var view = this;
      var $attachments = view.$id('attachments');
      var $last = $attachments.children().last();

      $attachments.find('.fap-attachment').remove();

      view.model.serializeDetails().attachments.forEach(function(attachment)
      {
        view.renderAttachment(attachment, true).insertBefore($last);
      });

      view.model.uploadedFiles.forEach(function(attachment)
      {
        view.renderAttachment(attachment, true).insertBefore($last);
      });

      if (view.model.uploading)
      {
        view.renderAttachment(view.model.uploading.upload, false).insertBefore($last);
      }

      view.model.uploadQueue.forEach(function(attachment)
      {
        view.renderAttachment(attachment, false).insertBefore($last);
      });

      if (view.attachmentToRename)
      {
        view.handleRenameAttachment(view.attachmentToRename);
        view.attachmentToRename = null;
      }
    },

    renderAttachment: function(attachment, uploaded)
    {
      return this.renderPartial(attachmentTemplate, {
        entryId: this.model.id,
        uploaded: uploaded,
        attachment: attachment
      });
    },

    findAttachment: function(id)
    {
      var entry = this.model;
      var attachment = _.findWhere(entry.get('attachments'), {_id: id});

      if (attachment)
      {
        return attachment;
      }

      if (entry.uploading && entry.uploading.upload._id === id)
      {
        return entry.uploading.upload;
      }

      for (var i = 0; i < entry.uploadedFiles.length; ++i)
      {
        if (entry.uploadedFiles[i]._id === id)
        {
          return entry.uploadedFiles[i];
        }
      }

      for (var j = 0; j < entry.uploadQueue.length; ++j)
      {
        if (entry.uploadQueue[j]._id === id)
        {
          return entry.uploadQueue[j];
        }
      }

      return null;
    },

    showPreview: function(attachmentId)
    {
      var attachment = this.findAttachment(attachmentId);

      if (!attachment)
      {
        return;
      }

      var $preview = this.$id('preview')
        .removeClass('hidden')
        .attr('data-attachment-id', attachmentId);

      $preview
        .find('span')
        .text(attachment.name);

      $preview
        .find('img')
        .prop('src', attachment.src || ('/fap/entries/' + this.model.id + '/attachments/' + attachmentId));
    },

    hidePreview: function(attachmentId)
    {
      if (attachmentId && this.$id('preview').attr('data-attachment-id') !== attachmentId)
      {
        return;
      }

      this.$id('preview').addClass('hidden');
    },

    focusAttachment: function(id)
    {
      var $attachment = this.$('.fap-attachment[data-attachment-id="' + id + '"]');

      if (!$attachment.length)
      {
        return;
      }

      if ($attachment[0].scrollIntoViewIfNeeded)
      {
        $attachment[0].scrollIntoViewIfNeeded();
      }
      else
      {
        $attachment[0].scrollIntoView();
      }

      this.$('.highlight').removeClass('highlight');

      clearTimeout(this.timers.highlight);

      $attachment.addClass('highlight');

      this.timers.highlight = setTimeout(function() { $attachment.removeClass('highlight'); }, 1100);

      if ($attachment[0].dataset.preview === '1')
      {
        this.showPreview(id);
      }
    },

    onKeyDown: function(e)
    {
      if (e.originalEvent.key === 'Escape')
      {
        this.hidePreview();
      }
    },

    onPaste: function(e)
    {
      var dt = e.originalEvent.clipboardData;

      if (dt && dt.files && dt.files.length)
      {
        this.upload(dt.files, true);
      }
    },

    onDrag: function(e)
    {
      e.preventDefault();
      e.stopPropagation();
    },

    onDrop: function(e)
    {
      var dt = e.originalEvent.dataTransfer;

      if (dt && dt.files && dt.files.length)
      {
        this.upload(dt.files, false);
      }

      return false;
    },

    upload: function(fileList, fromClipboard)
    {
      var view = this;

      if (!view.model.serializeDetails().auth.attachments)
      {
        viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: view.t('upload:auth')
        });

        return;
      }

      var entry = view.model;
      var attachments = {};

      (entry.get('attachments') || []).forEach(function(a)
      {
        attachments[a.name + a.size] = true;
      });

      if (entry.uploading)
      {
        attachments[entry.uploading.upload.name + entry.uploading.upload.file.size] = true;
      }

      entry.uploadQueue.forEach(function(u)
      {
        attachments[u.name + u.file.size] = true;
      });

      entry.uploadedFiles.forEach(function(u)
      {
        attachments[u.name + u.file.size] = true;
      });

      var files = Array.prototype.slice.call(fileList).filter(function(file)
      {
        var exists = attachments[file.name + file.size];

        if (exists)
        {
          return false;
        }

        attachments[file.name + file.size] = true;

        return true;
      });

      if (!files.length)
      {
        return;
      }

      var totalFiles = (entry.uploading ? 1 : 0)
        + entry.uploadQueue.length
        + entry.uploadedFiles.length
        + files.length;

      if (totalFiles > 5)
      {
        viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: view.t('upload:tooMany', {max: 5})
        });

        return false;
      }

      var $last = view.$id('attachments').children().last();

      files.forEach(function(file)
      {
        entry.uploadQueue.push({
          _id: uuid(),
          type: file.type,
          name: file.name,
          file: file,
          src: file.type.indexOf('image/') === 0 ? URL.createObjectURL(file) : null,
          rename: fromClipboard && files.length === 1 && file.type.indexOf('image/') === 0
        });

        view.renderAttachment(view.model.serializeAttachment(_.last(entry.uploadQueue)), false).insertBefore($last);
      });

      if (!entry.uploading)
      {
        view.uploadNext();
      }
    },

    uploadNext: function()
    {
      var view = this;
      var entry = view.model;
      var upload = entry.uploadQueue.shift();

      if (!upload)
      {
        return view.saveUploads();
      }

      view.$id('submit').prop('disabled', true);

      var $attachments = view.$id('attachments');
      var formData = new FormData();

      formData.append('file', upload.file);

      entry.uploading = view.ajax({
        type: 'POST',
        url: '/fap/entries;upload',
        data: formData,
        processData: false,
        contentType: false
      });

      entry.uploading.upload = upload;

      entry.uploading.fail(function()
      {
        view.removeAttachment(upload._id);

        if (entry.uploading.statusText === 'abort')
        {
          return;
        }

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('upload:failure', {file: upload.file.name})
        });
      });

      entry.uploading.done(function(hash)
      {
        var $attachment = $attachments.find('[data-attachment-id="' + upload._id + '"]');

        $attachment.find('.fa-spin').removeClass('fa-spin');

        upload.hash = hash;

        entry.uploadedFiles.push(upload);
      });

      entry.uploading.always(function()
      {
        entry.uploading = null;

        view.uploadNext();
      });
    },

    removeAttachment: function(id)
    {
      this.hidePreview(id);
      this.$id('attachments').find('[data-attachment-id="' + id + '"]').remove();
    },

    saveUploads: function()
    {
      var view = this;

      if (!view.model.uploadedFiles.length)
      {
        return;
      }

      var date = new Date().toISOString();
      var userInfo = user.getInfo();
      var attachments = view.model.uploadedFiles.map(function(upload)
      {
        if (upload.rename)
        {
          view.attachmentToRename = upload.hash;
        }

        return {
          _id: upload.hash,
          date: date,
          user: userInfo,
          type: upload.file.type,
          size: upload.file.size,
          name: upload.name
        };
      });

      view.model.uploadedFiles = [];

      view.model.change('attachments', attachments, null);
    },

    hideEditor: function()
    {
      if (this.$('.fap-editor').length)
      {
        this.model.trigger('editor:hide');
      }
    },

    handleRenameAttachment: function(id)
    {
      this.model.trigger('editor:show', this.$('[data-attachment-id="' + id + '"]'), 'attachment');
    },

    handleRemoveAttachment: function(id)
    {
      var attachments = [this.findAttachment(id)];

      this.model.handleChange({
        date: new Date(),
        user: user.getInfo(),
        data: {
          attachments: [attachments, null]
        },
        comment: ''
      });
      this.model.update({
        attachments: attachments
      });
    }

  });
});
