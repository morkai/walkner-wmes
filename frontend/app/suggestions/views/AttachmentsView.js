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
  'app/suggestions/templates/attachments/panel',
  'app/suggestions/templates/attachments/preview',
  'app/suggestions/templates/attachments/delete'
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

    template: template,

    events: {

      'click .suggestions-attachment': function(e)
      {
        const $attachment = this.$(e.currentTarget);

        if (e.button === 0 && !e.ctrlKey && $attachment.find('.suggestions-attachment-img').length)
        {
          this.showPreview($attachment[0].dataset.id);

          return false;
        }
      },

      'contextmenu .suggestions-attachment': function(e)
      {
        e.preventDefault();

        var attachment = this.model.get('attachments').find(function(a)
        {
          return a._id === e.currentTarget.dataset.id;
        });

        if (!attachment)
        {
          return;
        }

        var menu = [{
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

      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change:attachments', _.debounce(this.render, 1));
        this.listenTo(this.model, 'seen', this.onSeen);
      });

      $(window)
        .on('keydown.' + this.idPrefix, this.onWindowKeyDown.bind(this))
        .on('resize.' + this.idPrefix, _.debounce(this.onWidowResize.bind(this), 33));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      if (this.$preview)
      {
        this.$preview.remove();
        this.$preview = null;
      }
    },

    getTemplateData: function()
    {
      var observer = this.model.get('observer');

      return {
        panelTitle: this.getPanelTitle(),
        attachments: this.serializeAttachments(),
        unseen: observer.notify && (observer.changes.all || !!observer.changes.attachments),
        hideEmpty: !!this.options.hideEmpty
      };
    },

    getPanelTitle: function()
    {
      return this.t('attachments:panelTitle:' + (this.options.kind || 'default'));
    },

    serializeAttachments: function()
    {
      var view = this;

      return view.model
        .get('attachments')
        .filter(view.filterAttachment, view)
        .map(function(attachment)
        {
          return {
            _id: attachment._id,
            time: Date.parse(attachment.date),
            name: attachment.name,
            icon: fileIcons.getByMime(attachment.type),
            image: attachment.type.startsWith('image/'),
            url: view.model.getAttachmentUrl(attachment)
          };
        }).sort(function(a, b)
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
      var $attachments = this.$('.suggestions-attachments');

      if (!$attachments.length)
      {
        return;
      }

      var containerWidth = $attachments.parent().outerWidth()
        - (this.$el.hasClass('suggestions-attachments-bordered') ? 30 : 0);

      this.$el.toggleClass('suggestions-attachments-bordered', $attachments.outerWidth() < containerWidth);
    },

    handleOpenAttachment: function(attachment)
    {
      window.open(this.model.getAttachmentUrl(attachment), '_blank');
    },

    handleEditAttachment: function(attachment)
    {
      var dialogView = new EditAttachmentView({
        model: this.model,
        attachment
      });

      viewport.showDialog(dialogView, this.t('attachments:edit:title'));
    },

    handleDeleteAttachment: function(attachment)
    {
      var dialogView = new DialogView({
        template: deleteTemplate,
        nlsDomain: this.model.getNlsDomain(),
        model: attachment
      });

      viewport.showDialog(dialogView, this.t('attachments:delete:title'));

      this.listenTo(dialogView, 'answered', function(answer)
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

      var req = this.ajax({
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
      var attachment = this.model.get('attachments').find(function(a) { return a._id === attachmentId; });

      if (!attachment && this.$preview)
      {
        return this.hidePreview();
      }

      if (!this.$preview)
      {
        this.$preview = this.renderPartial(previewTemplate).appendTo(document.body);

        this.$preview.find('.suggestions-attachment-preview-close').on('click', this.hidePreview.bind(this));
        this.$preview.find('.suggestions-attachment-preview-prev').on('click', this.prevPreview.bind(this));
        this.$preview.find('.suggestions-attachment-preview-next').on('click', this.nextPreview.bind(this));
        this.$preview.on('wheel', () => false);
      }

      var src = this.model.getAttachmentUrl(attachment);
      var $img = this.$preview.find('.suggestions-attachment-preview-img');
      var $name = this.$preview.find('.suggestions-attachment-preview-name');

      $img.css('background-image', 'url(' + src + ')');
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
      var view = this;

      if (!view.$preview || view.$preview.hasClass('hidden'))
      {
        return;
      }

      var images = view.model.get('attachments').filter(
        function(a) { return a.type.startsWith('image/') && view.filterAttachment(a); }
      );

      if (!images.length)
      {
        return view.hidePreview();
      }

      var currentId = view.$preview.data('attachmentId');
      var currentI = images.findIndex(function(a) { return a._id === currentId; });
      var prevI = 0;

      if (currentI === 0)
      {
        prevI = images.length - 1;
      }
      else if (currentI !== -1 && currentI !== 1)
      {
        prevI = currentI - 1;
      }

      view.showPreview(images[prevI]._id);
    },

    nextPreview: function()
    {
      var view = this;

      if (!view.$preview || view.$preview.hasClass('hidden'))
      {
        return;
      }

      var images = view.model.get('attachments').filter(
        function(a) { return a.type.startsWith('image/') && view.filterAttachment(a); }
      );

      if (!images.length)
      {
        return view.hidePreview();
      }

      var currentId = view.$preview.data('attachmentId');
      var currentI = images.findIndex(a => a._id === currentId);
      var nextI = 0;

      if (currentI !== -1 && currentI !== images.length - 1)
      {
        nextI = currentI + 1;
      }

      view.showPreview(images[nextI]._id);
    },

    onWindowKeyDown: function(e)
    {
      if (!e.key)
      {
        return;
      }

      var key = e.key.toLowerCase();

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
      this.$('.suggestions-unseen').removeClass('suggestions-unseen');
    }

  });
});
