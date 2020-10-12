// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/core/util/fileIcons',
  'app/planning/util/contextMenu',
  '../NearMiss',
  'app/wmes-osh-nearMisses/templates/attachments/panel',
  'app/wmes-osh-nearMisses/templates/attachments/preview',
  'app/wmes-osh-nearMisses/templates/attachments/delete'
], function(
  $,
  viewport,
  View,
  DialogView,
  fileIcons,
  contextMenu,
  NearMiss,
  template,
  previewTemplate,
  deleteTemplate
) {
  'use strict';

  return View.extend({

    template,

    events: {

      'click .osh-attachment-img': function(e)
      {
        if (e.button === 0 && !e.ctrlKey)
        {
          this.showPreview(this.$(e.target).closest('.osh-attachment')[0].dataset.id);

          return false;
        }
      },

      'contextmenu .osh-attachment': function(e)
      {
        e.preventDefault();

        const attachment = this.model.get('attachments').find(a => a._id === e.currentTarget.dataset.id);

        if (!attachment)
        {
          return;
        }

        const menu = [{
          icon: 'fa-external-link',
          label: this.t('attachments:open'),
          handler: this.handleOpenAttachment.bind(this, attachment)
        }];

        if (NearMiss.can.editAttachment(this.model, attachment))
        {
          menu.push({
            icon: 'fa-edit',
            label: this.t('attachments:edit'),
            handler: this.handleEditAttachment.bind(this, attachment),
            disabled: true
          });
        }

        if (NearMiss.can.deleteAttachment(this.model, attachment))
        {
          menu.push({
            icon: 'fa-trash',
            label: this.t('attachments:delete'),
            handler: this.handleDeleteAttachment.bind(this, attachment)
          });
        }

        contextMenu.show(this, e.pageY, e.pageX, menu);
      }

    },

    initialize: function()
    {
      this.$preview = null;

      this.once('afterRender', () =>
      {
        this.listenTo(this.model, 'change:attachments', this.render);
      });

      $(window).on(`keydown.${this.idPrefix}`, this.onWindowKeyDown.bind(this));
    },

    destroy: function()
    {
      $(window).off(`.${this.idPrefix}`);

      if (this.$preview)
      {
        this.$preview.remove();
        this.$preview = null;
      }
    },

    getTemplateData: function()
    {
      return {
        modelType: this.model.getModelType(),
        modelId: this.model.id,
        attachments: this.serializeAttachments()
      };
    },

    serializeAttachments: function()
    {
      return this.model.get('attachments').map(attachment =>
      {
        return {
          _id: attachment._id,
          time: Date.parse(attachment.date),
          name: attachment.name,
          icon: fileIcons.getByMime(attachment.type),
          image: attachment.type.startsWith('image/'),
          url: this.model.getAttachmentUrl(attachment)
        };
      }).sort((a, b) =>
      {
        if (a.image && !b.image)
        {
          return -1;
        }

        if (!a.image && b.image)
        {
          return 1;
        }

        return a.time - b.time;
      });
    },

    handleOpenAttachment: function(attachment)
    {
      window.open(this.model.getAttachmentUrl(attachment), '_blank');
    },

    handleEditAttachment: function(attachment)
    {
      console.log('handleEditAttachment', attachment);
    },

    handleDeleteAttachment: function(attachment)
    {
      const dialogView = new DialogView({
        template: deleteTemplate,
        nlsDomain: this.model.getNlsDomain(),
        model: attachment
      });

      viewport.showDialog(dialogView, this.t('attachments:delete:title'));

      this.listenTo(dialogView, 'answered', answer =>
      {
        if (answer === 'yes')
        {
          this.deleteAttachment(attachment);
        }
      });
    },

    deleteAttachment: function(attachment)
    {
      viewport.msg.saving();

      const req = this.ajax({
        method: 'PUT',
        url: this.model.url(),
        data: JSON.stringify({
          attachments: {
            deleted: [attachment._id]
          }
        })
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();
      });

      req.done(function()
      {
        viewport.msg.saved();
      });
    },

    showPreview: function(attachmentId)
    {
      const attachment = this.model.get('attachments').find(a => a._id === attachmentId);

      if (!attachment && this.$preview)
      {
        return this.hidePreview();
      }

      if (!this.$preview)
      {
        this.$preview = this.renderPartial(previewTemplate).appendTo(document.body);

        this.$preview.find('.osh-attachment-preview-close').on('click', this.hidePreview.bind(this));
        this.$preview.find('.osh-attachment-preview-prev').on('click', this.prevPreview.bind(this));
        this.$preview.find('.osh-attachment-preview-next').on('click', this.nextPreview.bind(this));
        this.$preview.on('wheel', () => false);
      }

      const src = this.model.getAttachmentUrl(attachment);
      const $img = this.$preview.find('.osh-attachment-preview-img');
      const $name = this.$preview.find('.osh-attachment-preview-name');

      $img.css('background-image', `url(${src})`);
      $name.text(attachment.name);

      this.$preview.data('attachmentId', attachmentId);

      this.$preview.removeClass('hidden');

      $name.css('margin-left', ($name.outerWidth() / 2 * -1) + 'px');
    },

    hidePreview: function()
    {
      if (this.$preview)
      {
        this.$preview.addClass('hidden');
      }
    },

    prevPreview: function()
    {
      if (!this.$preview || this.$preview.hasClass('hidden'))
      {
        return;
      }

      const images = this.model.get('attachments').filter(a => a.type.startsWith('image/'));

      if (!images.length)
      {
        return this.hidePreview();
      }

      const currentId = this.$preview.data('attachmentId');
      const currentI = images.findIndex(a => a._id === currentId);
      let prevI = 0;

      if (currentI === 0)
      {
        prevI = images.length - 1;
      }
      else if (currentI !== -1 && currentI !== 1)
      {
        prevI = currentI - 1;
      }

      this.showPreview(images[prevI]._id);
    },

    nextPreview: function()
    {
      if (!this.$preview || this.$preview.hasClass('hidden'))
      {
        return;
      }

      const images = this.model.get('attachments').filter(a => a.type.startsWith('image/'));

      if (!images.length)
      {
        return this.hidePreview();
      }

      const currentId = this.$preview.data('attachmentId');
      const currentI = images.findIndex(a => a._id === currentId);
      let nextI = 0;

      if (currentI !== -1 && currentI !== images.length - 1)
      {
        nextI = currentI + 1;
      }

      this.showPreview(images[nextI]._id);
    },

    onWindowKeyDown: function(e)
    {
      if (e.key === 'Escape')
      {
        this.hidePreview();
      }
      else if (e.key === 'ArrowLeft')
      {
        this.prevPreview();
      }
      else if (e.key === 'ArrowRight')
      {
        this.nextPreview();
      }
    }

  });
});
