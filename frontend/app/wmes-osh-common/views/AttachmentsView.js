// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  'app/core/util/fileIcons',
  'app/planning/util/contextMenu',
  './EditAttachmentView',
  'app/wmes-osh-common/templates/attachments/panel',
  'app/wmes-osh-common/templates/attachments/preview',
  'app/wmes-osh-common/templates/attachments/delete'
], function(
  _,
  $,
  viewport,
  View,
  DialogView,
  fileIcons,
  contextMenu,
  EditAttachmentView,
  template,
  previewTemplate,
  deleteTemplate
) {
  'use strict';

  return View.extend({

    nlsDomain: 'wmes-osh-common',

    template,

    events: {

      'click .osh-attachment': function(e)
      {
        const $attachment = this.$(e.currentTarget);

        if (e.button === 0 && !e.ctrlKey && $attachment.find('.osh-attachment-img').length)
        {
          this.showPreview($attachment[0].dataset.id);

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

        if (this.model.constructor.can.editAttachment(this.model, attachment))
        {
          menu.push({
            icon: 'fa-edit',
            label: this.t('attachments:edit'),
            handler: this.handleEditAttachment.bind(this, attachment)
          });
        }

        if (this.model.constructor.can.deleteAttachment(this.model, attachment))
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
        this.listenTo(this.model, 'change:attachments', _.debounce(this.render, 1));
        this.listenTo(this.model, 'seen', this.onSeen);
      });

      $(window)
        .on(`keydown.${this.idPrefix}`, this.onWindowKeyDown.bind(this))
        .on(`resize.${this.idPrefix}`, _.debounce(this.onWidowResize.bind(this), 33));
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
      const observer = this.model.getObserver();

      return {
        panelTitle: this.getPanelTitle(),
        attachments: this.serializeAttachments(),
        unseen: observer.notify && (observer.changes.all || !!observer.changes.attachments),
        hideEmpty: !!this.options.hideEmpty
      };
    },

    getPanelTitle: function()
    {
      return this.t(`attachments:panelTitle:${this.options.kind || 'default'}`);
    },

    serializeAttachments: function()
    {
      return this.model
        .get('attachments')
        .filter(this.filterAttachment, this)
        .map(attachment =>
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

    filterAttachment: function(attachment)
    {
      return !this.options.kind || (attachment.kind || 'other') === this.options.kind;
    },

    afterRender: function()
    {
      this.toggleBorders();
    },

    toggleBorders: function()
    {
      const $attachments = this.$('.osh-attachments');

      if (!$attachments.length)
      {
        return;
      }

      const containerWidth = $attachments.parent().outerWidth()
        - (this.$el.hasClass('osh-attachments-bordered') ? 30 : 0);

      this.$el.toggleClass('osh-attachments-bordered', $attachments.outerWidth() < containerWidth);
    },

    handleOpenAttachment: function(attachment)
    {
      window.open(this.model.getAttachmentUrl(attachment), '_blank');
    },

    handleEditAttachment: function(attachment)
    {
      const dialogView = new EditAttachmentView({
        model: this.model,
        attachment
      });

      viewport.showDialog(dialogView, this.t('attachments:edit:title'));
    },

    handleDeleteAttachment: function(attachment)
    {
      const dialogView = new DialogView({
        template: deleteTemplate,
        nlsDomain: this.nlsDomain,
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

      const images = this.model.get('attachments').filter(
        a => a.type.startsWith('image/') && this.filterAttachment(a)
      );

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

      const images = this.model.get('attachments').filter(
        a => a.type.startsWith('image/') && this.filterAttachment(a)
      );

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
      const key = e.key.toLowerCase();

      if (key === 'escape')
      {
        this.hidePreview();
      }
      else if (key === 'arrowleft' || key === 'a')
      {
        this.prevPreview();
      }
      else if (key === 'arrowright' || key === 'd')
      {
        this.nextPreview();
      }
    },

    onWidowResize: function()
    {
      this.toggleBorders();
    },

    onSeen: function()
    {
      this.$('.osh-unseen').removeClass('osh-unseen');
    }

  });
});
