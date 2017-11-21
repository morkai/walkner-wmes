// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/user',
  'app/core/View',
  'app/paintShop/PaintShopEventCollection',
  'app/paintShop/templates/orderDetails',
  'app/paintShop/templates/orderChanges',
  'app/paintShop/templates/orderChange',
  'app/paintShop/templates/queueOrder'
], function(
  $,
  t,
  viewport,
  user,
  View,
  PaintShopEventCollection,
  orderDetailsTemplate,
  orderChangesTemplate,
  orderChangeTemplate,
  queueOrderTemplate
) {
  'use strict';

  return View.extend({

    template: orderDetailsTemplate,

    dialogClassName: 'paintShop-orderDetails-dialog',

    events: {
      'focus #-qtyDone': function(e)
      {
        if (!this.vkb)
        {
          return;
        }

        clearTimeout(this.timers.hideVkb);

        if (!this.vkb.show(e.currentTarget))
        {
          return;
        }

        this.vkb.$el.css({
          top: 'auto',
          bottom: '30px'
        });

        this.resizeChanges();
      },
      'blur #-qtyDone': 'scheduleHideVkb',
      'click .btn[data-action]': function(e)
      {
        var view = this;
        var $comment = view.$changes.find('.paintShop-orderChanges-comment');
        var comment = $comment.val().trim();
        var action = e.currentTarget.dataset.action;
        var qtyDone = Math.max(0, parseInt(view.$id('qtyDone').val(), 10) || 0);

        if (action === 'comment' && comment.length === 0)
        {
          $comment.focus();

          return;
        }

        var $actions = view.$('.btn').prop('disabled', true);

        view.act(action, comment, qtyDone)
          .fail(function() { $actions.prop('disabled', false); })
          .done(function() { view.closeDialog(); });
      }
    },

    initialize: function()
    {
      this.vkb = this.options.vkb;
      this.psEvents = PaintShopEventCollection.forOrder(this.model.id);

      this.listenTo(this.model, 'change', this.reloadChanges.bind(this));

      $(window).on('resize.' + this.idPrefix, this.onWindowResize.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      if (this.vkb)
      {
        this.vkb.hide();
      }

      if (this.$changes)
      {
        this.$changes.remove();
        this.$changes = null;
      }
    },

    closeDialog: function() {},

    serialize: function()
    {
      var isEmbedded = window.parent !== window;
      var isLocal = user.isAllowedTo('LOCAL');
      var isPainter = user.isAllowedTo('PAINT_SHOP:PAINTER');
      var canManage = user.isAllowedTo('PAINT_SHOP:MANAGE');

      return {
        idPrefix: this.idPrefix,
        order: this.model.serialize(),
        fillerHeight: this.calcFillerHeight(),
        renderQueueOrder: queueOrderTemplate,
        canAct: (isEmbedded && isLocal) || isPainter || canManage
      };
    },

    beforeRender: function()
    {
      if (this.$changes)
      {
        this.$changes.remove();
        this.$changes = null;
      }
    },

    afterRender: function()
    {
      if (this.options.height === 0)
      {
        this.options.height = this.$('tbody')[0].clientHeight;

        this.$id('filler').css('height', this.calcFillerHeight() + 'px');
      }

      this.renderChanges();
      this.reloadChanges();
    },

    renderChanges: function()
    {
      var view = this;
      var $changes = $(orderChangesTemplate());

      $changes.find('.paintShop-orderChanges-comment').on('focus', function()
      {
        if (view.options.vkb)
        {
          clearTimeout(view.timers.hideVkb);

          view.options.vkb.show(this);
          view.resizeChanges();
        }
      }).on('blur', function()
      {
        if (view.options.vkb)
        {
          view.scheduleHideVkb();
        }
      });

      $changes.appendTo(this.$el.parent());

      this.$changes = $changes;

      this.resizeChanges();
    },

    reloadChanges: function()
    {
      var view = this;

      view.promised(view.psEvents.fetch({reset: true})).done(function()
      {
        var html = view.psEvents.map(function(event)
        {
          return orderChangeTemplate({change: event.serialize()});
        });

        view.$changes
          .find('.paintShop-orderChanges-changes')
          .html(html)
          .prop('scrollTop', 99999);
      });
    },

    scheduleHideVkb: function()
    {
      clearTimeout(this.timers.hideVkb);

      this.timers.hideVkb = setTimeout(this.hideVkb.bind(this), 250);
    },

    hideVkb: function()
    {
      clearTimeout(this.timers.hideVkb);

      if (this.vkb)
      {
        this.vkb.hide();
        this.resizeChanges();
      }
    },

    resizeChanges: function()
    {
      this.$changes
        .css('height', this.calcChangesHeight() + 'px')
        .find('.paintShop-orderChanges-changes')
        .prop('scrollTop', 99999);
    },

    calcFillerHeight: function()
    {
      return Math.max(window.innerHeight - 30 * 2 - 25 - 75 - this.options.height, 0);
    },

    calcChangesHeight: function()
    {
      var vkbHeight = this.vkb ? this.vkb.$el.outerHeight() : 0;

      if (!vkbHeight)
      {
        vkbHeight = -30;
      }

      return Math.max(window.innerHeight - 2 - 30 * 2 - 30 - vkbHeight, 0);
    },

    act: function(action, comment, qtyDone)
    {
      var reqData = {
        action: action,
        orderId: this.model.id,
        comment: comment,
        qtyDone: qtyDone
      };

      return this.model.collection.act(reqData, function(err)
      {
        if (err)
        {
          return viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('paintShop', 'MSG:' + action + ':failure')
          });
        }
      });
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    onWindowResize: function()
    {
      this.$id('filler').css('height', this.calcFillerHeight() + 'px');

      this.resizeChanges();
    }

  });
});
