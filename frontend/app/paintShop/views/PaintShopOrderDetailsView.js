// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/user',
  'app/core/View',
  'app/paintShop/templates/orderDetails',
  'app/paintShop/templates/queueOrder'
], function(
  $,
  t,
  viewport,
  user,
  View,
  template,
  queueOrderTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'paintShop-orderDetails-dialog',

    events: {
      'click .btn[data-action]': function(e)
      {
        var view = this;
        var $actions = view.$('.btn').prop('disabled', true);

        view.act(e.currentTarget.dataset.action)
          .fail(function() { $actions.prop('disabled', false); })
          .done(function() { view.closeDialog(); });
      }
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
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
        canAct: (isEmbedded && isLocal) || isPainter || canManage,
        canResetIgnore: canManage
      };
    },

    afterRender: function()
    {
      if (this.options.height === 0)
      {
        this.options.height = this.$('tbody')[0].clientHeight;

        this.$id('filler').css('height', this.calcFillerHeight() + 'px');
      }
    },

    calcFillerHeight: function()
    {
      return Math.max(window.innerHeight - 30 * 2 - 25 - 75 - this.options.height, 0);
    },

    act: function(action)
    {
      return this.model.collection.act({action: action, orderId: this.model.id}, function(err)
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
    }

  });
});
