// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/core/View',
  'app/wmes-fap-entries/templates/chat',
  'app/wmes-fap-entries/templates/chatMessage'
], function(
  _,
  $,
  user,
  View,
  template,
  messageTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'keydown #-send': function(e)
      {
        var key = e.originalEvent.key;
        var enter = key === 'Enter';
        var whitespace = enter || key === ' ';

        if (whitespace && e.target.value.trim() === '')
        {
          return false;
        }

        if (enter && !e.shiftKey)
        {
          this.send();

          return false;
        }
      },
      'keyup #-send': function()
      {
        var $messages = this.$id('messages');
        var $send = this.$id('send');
        var oldHeight = $send[0].offsetHeight;
        var rows = $send.val().split('\n').length;
        var scroll = false;

        if (rows > 10)
        {
          rows = 10;
          scroll = true;
        }

        $send.attr('rows', rows).toggleClass('fap-chat-send-scroll', scroll);

        var newHeight = $send[0].offsetHeight;
        var heightDiff = newHeight - oldHeight;

        $messages.css('height', 563 - newHeight);

        if (heightDiff < 0 && this.isScrolledToBottom())
        {
          return;
        }

        $messages[0].scrollTop += newHeight - oldHeight;
      },
      'click #-new': function()
      {
        var $messages = this.$id('messages');

        this.$id('new').addClass('hidden');

        $messages.animate({scrollTop: $messages[0].scrollHeight}, 'fast');
      },
      'click .fap-chat-attachment': function(e)
      {
        this.model.trigger('focusAttachment', e.currentTarget.dataset.attachmentId);
      }

    },

    initialize: function()
    {
      this.chatScrollTop = -1;

      this.listenTo(this.model, 'change:changes', this.onChange);
    },

    getTemplateData: function()
    {
      return {
        model: this.model.serializeDetails(),
        renderMessage: messageTemplate
      };
    },

    afterRender: function()
    {
      var $messages = this.$id('messages');

      $messages[0].scrollTop = this.chatScrollTop === -1 ? 9999999 : this.chatScrollTop;

      $messages.on('scroll', this.onScroll.bind(this));
    },

    send: function()
    {
      var view = this;
      var $send = view.$id('send');
      var comment = $send.val().trim();
      var data = {};

      $send.val('');

      if (user.isLoggedIn() && !view.model.isObserver())
      {
        data.subscribers = [null, [{
          id: user.data._id,
          label: user.getLabel()
        }]];
      }

      view.model.handleChange({
        date: new Date(),
        user: user.getInfo(),
        data: data,
        comment: comment
      });

      view.model.update({
        comment: comment
      });
    },

    onChange: function()
    {
      if (!this.isRendered())
      {
        return;
      }

      var change = _.last(this.model.get('changes'));

      if (change && change.user)
      {
        this.handleChange(change);
      }
    },

    handleChange: function(change)
    {
      var message = this.model.serializeChatMessage(change);

      if (!message.lines.length)
      {
        return;
      }

      var $messages = this.$id('messages');
      var $lastMessage = this.$($messages[0].lastElementChild);
      var scrollToBottom = this.isScrolledToBottom();

      if ($lastMessage[0].dataset.userId === change.user.id)
      {
        var $lines = $lastMessage.find('.fap-chat-lines');

        message.lines.forEach(function(line)
        {
          $('<div class="fap-chat-line"></div>')
            .attr('title', line.time)
            .html(line.text)
            .appendTo($lines);
        });
      }
      else
      {
        this.renderPartial(messageTemplate, {message: message}).appendTo($messages);
      }

      if (scrollToBottom)
      {
        $messages[0].scrollTop = $messages[0].scrollHeight;
      }
      else if (user.data._id !== change.user.id)
      {
        this.$id('new').removeClass('hidden');
      }
    },

    isScrolledToBottom: function()
    {
      var messagesEl = this.$id('messages')[0];

      return messagesEl.scrollHeight - messagesEl.scrollTop === messagesEl.clientHeight;
    },

    onScroll: function(e)
    {
      this.chatScrollTop = e.target.scrollTop;

      if (this.isScrolledToBottom())
      {
        this.$id('new').addClass('hidden');
      }
    }

  });
});
