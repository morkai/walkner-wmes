// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/planning/PlanSapOrder',
  'app/wh/templates/problems/chat',
  'app/wh/templates/problems/chatMessage'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  userInfoTemplate,
  PlanSapOrder,
  chatTemplate,
  chatMessageTemplate
) {
  'use strict';

  return View.extend({

    template: chatTemplate,

    events: {
      'submit': function()
      {
        var $message = this.$id('message');

        this.send($message.val());

        $message.val('').focus();

        return false;
      },
      'keydown #-message': function(e)
      {
        if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey || e.altKey))
        {
          this.$('.btn-primary').click();

          return false;
        }
      }
    },

    initialize: function()
    {
      var view = this;

      view.listenTo(view.plan.sapOrders, 'add', view.renderMessages);
      view.listenTo(view.plan.sapOrders, 'change:comments', view.onSapOrderChanged);

      $(window).on('resize.' + view.idPrefix, view.resize.bind(view));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      return {
        canComment: user.can.commentOrders()
      };
    },

    afterRender: function()
    {
      this.resize();
      this.renderMessages();
    },

    resize: function()
    {
      var rect = $('.modal-header')[0].getBoundingClientRect();
      var height = window.innerHeight - 14 - 74 - 14 - 31;

      if (rect.height)
      {
        height -= rect.top + rect.height;
      }
      else
      {
        height -= 31 + 55;
      }

      this.$id('messages')[0].style.height = height + 'px';
    },

    scrollToBottom: function()
    {
      var $messages = this.$id('messages');

      $messages.prop('scrollTop', $messages.prop('scrollHeight'));
    },

    renderMessages: function()
    {
      this.$id('messages').html('');

      var sapOrder = this.plan.sapOrders.at(0);

      if (sapOrder)
      {
        sapOrder.get('comments').forEach(this.renderMessage, this);
      }

      this.scrollToBottom();
    },

    renderMessage: function(comment)
    {
      var text = PlanSapOrder.formatCommentWithIcon(comment);

      if (!text)
      {
        return;
      }

      var $message = this.renderPartial(chatMessageTemplate, {
        time: time.format(comment.time, 'LL, HH:mm:ss'),
        user: userInfoTemplate({userInfo: comment.user, noIp: true}),
        text: text
      });

      this.$id('messages').append($message);
    },

    send: function(message)
    {
      message = message.trim();

      if (!message.replace(/[^A-Z0-9]+/ig, '').length)
      {
        return;
      }

      this.scrollToBottom();
      this.ajax({
        method: 'POST',
        url: '/orders/' + this.model.get('order'),
        data: JSON.stringify({
          source: 'wh',
          comment: message
        })
      });
    },

    onSapOrderChanged: function(sapOrder, comments)
    {
      var messagesEl = this.$id('messages')[0];
      var scrolledToBottom = messagesEl.scrollHeight - messagesEl.scrollTop === messagesEl.clientHeight;

      this.renderMessage(comments[comments.length - 1]);

      if (scrolledToBottom)
      {
        this.scrollToBottom();
      }
    },

    onDialogShown: function()
    {
      this.resize();
      this.scrollToBottom();
    }

  });
});
