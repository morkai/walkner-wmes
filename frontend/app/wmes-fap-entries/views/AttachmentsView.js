// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/wmes-fap-entries/templates/attachments'
], function(
  _,
  $,
  View,
  template
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
      }

    },

    initialize: function()
    {
      var view = this;

      view.listenTo(view.model, 'focusAttachment', view.focusAttachment);

      $(window).on('keydown.' + view.idPrefix, view.onKeyDown.bind(view));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      return {
        model: this.model.serializeDetails()
      };
    },

    showPreview: function(attachmentId)
    {
      var attachment = _.findWhere(this.model.get('attachments'), {_id: attachmentId});

      if (!attachment)
      {
        return;
      }

      var $preview = this.$id('preview').removeClass('hidden');

      $preview
        .find('span')
        .text(attachment.name);

      $preview
        .find('img')
        .prop('src', '/fap/entries/' + this.model.id + '/attachments/' + attachmentId);
    },

    hidePreview: function()
    {
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
    }

  });
});
