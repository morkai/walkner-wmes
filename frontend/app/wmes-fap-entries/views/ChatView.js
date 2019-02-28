// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'getCaretCoordinates',
  'app/user',
  'app/core/View',
  'app/core/util/transliterate',
  'app/planning/util/contextMenu',
  'app/wmes-fap-entries/templates/chat',
  'app/wmes-fap-entries/templates/chatMessage'
], function(
  _,
  $,
  getCaretCoordinates,
  user,
  View,
  transliterate,
  contextMenu,
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

        if (key === 'Tab')
        {
          this.showUserAutocomplete();

          return false;
        }

        if (this.removeAutocompleteUser(key))
        {
          return false;
        }

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
      if (change.data.attachments && !change.data.attachments[1])
      {
        this.removeAttachments(change.data.attachments[0]);
      }

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

    removeAttachments: function(attachments)
    {
      var view = this;

      attachments.forEach(function(a)
      {
        view.$('.fap-chat-attachment[data-attachment-id="' + a._id + '"]').css('text-decoration', 'line-through');
      });
    },

    showUserAutocomplete: function()
    {
      var view = this;
      var sendEl = view.$id('send')[0];
      var to = sendEl.selectionEnd;
      var from = to - 1;
      var stopRe = /^[^a-zA-Z0-9]$/;
      var space = '\u00a0';
      var c = '';

      while (true) // eslint-disable-line no-constant-condition
      {
        c = transliterate(sendEl.value.charAt(from));

        if (c === space)
        {
          return;
        }

        if (c.length === 0)
        {
          from = 0;

          break;
        }

        if (c !== '\uDC64' && stopRe.test(c))
        {
          break;
        }

        --from;
      }

      while (true) // eslint-disable-line no-constant-condition
      {
        c = transliterate(sendEl.value.charAt(to));

        if (c === space)
        {
          return;
        }

        if (c.length === 0)
        {
          to = sendEl.value.length;

          break;
        }

        if (stopRe.test(c))
        {
          break;
        }

        ++to;
      }

      var prefix = sendEl.value.substring(0, from);
      var suffix = sendEl.value.substring(to);
      var filter = transliterate(sendEl.value.substring(from, to)).toUpperCase().replace(/[^A-Z0-9]+/g, '');

      if (prefix.length && !/[<\[{(\s]$/.test(prefix.charAt(prefix.length - 1)))
      {
        prefix += ' ';
      }

      if (suffix.length && !/^[!?,.>\]})\s]/.test(transliterate(suffix.charAt(0))))
      {
        suffix = ' ' + suffix;
      }

      var menu = [];
      var noFilter = filter.length === 0;
      var lastCommenters = {};
      var lastCommenter = 999;
      var changes = view.model.get('changes');

      for (var changeI = changes.length - 1; changeI >= 0; --changeI)
      {
        var change = changes[changeI];

        if (change.comment)
        {
          lastCommenters[change.user.id] = lastCommenter--;
        }
      }

      view.model.get('observers').forEach(function(o)
      {
        if (o.user.id === user.data._id)
        {
          return;
        }

        var searchName = transliterate(o.user.label).toUpperCase().replace(/[^A-Z0-9]+/g, '');
        var pos = noFilter ? -1 : searchName.indexOf(filter);

        if (noFilter || pos !== -1)
        {
          menu.push({
            label: o.user.label,
            handler: autocompleteUser.bind(null, o.user.label),
            score: (lastCommenters[o.user.id] || 0) + (noFilter ? 0 : pos === 0 ? 100 : 0)
          });
        }
      });

      if (menu.length === 0)
      {
        return;
      }

      if (menu.length === 1)
      {
        menu[0].handler();

        return;
      }

      menu.sort(function(a, b)
      {
        if (a.score === b.score)
        {
          return a.label.localeCompare(b.label, undefined, {numeric: true, ignorePunctuation: true});
        }

        return b.score - a.score;
      });

      if (menu.length > 10)
      {
        menu = menu.slice(0, 10);

        menu.push({
          disabled: true,
          label: '...'
        });
      }

      var pos = view.$('.fap-chat-form').position();
      var coords = getCaretCoordinates(sendEl, sendEl.selectionEnd);
      var top = pos.top + coords.top + coords.height;
      var left = pos.left + coords.left;

      contextMenu.show(view, top, left, {
        menu: menu
      });

      view.broker.subscribe('planning.contextMenu.hidden')
        .setLimit(1)
        .on('message', function()
        {
          view.$id('send').focus();
        });

      function autocompleteUser(user)
      {
        var caret = prefix + '👤' + user.replace(/\s+/g, space);

        if (suffix.length === 0)
        {
          caret += ' ';
        }

        sendEl.value = caret + suffix;
        sendEl.setSelectionRange(caret.length, caret.length);
      }
    },

    removeAutocompleteUser: function(key)
    {
      if (key !== 'Backspace' && key !== 'Delete')
      {
        return false;
      }

      var sendEl = this.$id('send')[0];
      var text = sendEl.value;
      var from = sendEl.selectionStart;
      var to = sendEl.selectionEnd;

      if (from === to)
      {
        if (key === 'Backspace' && from > 0)
        {
          from -= 1;
        }
        else if (key === 'Delete')
        {
          to += 1;
        }
      }

      var stopRe = /^[^a-zA-Z0-9\u00a0]$/;

      for (var fromI = from; fromI >= 0; --fromI)
      {
        var fromC = transliterate(text.charAt(fromI));

        if (fromC === '\uDC64')
        {
          from = fromI - 1;

          break;
        }

        if (stopRe.test(fromC))
        {
          break;
        }
      }

      for (var toFromI = to; toFromI >= 0; --toFromI)
      {
        var toFromC = transliterate(text.charAt(toFromI));

        if (toFromC === '\uDC64')
        {
          for (; to < text.length; ++to)
          {
            var toC = transliterate(text.charAt(to));

            if (toC !== '\uDC64' && stopRe.test(toC))
            {
              break;
            }
          }

          break;
        }

        if (stopRe.test(toFromC))
        {
          break;
        }
      }

      sendEl.value = text.substring(0, from) + text.substring(to);
      sendEl.setSelectionRange(from, from);

      return true;
    },

    isScrolledToBottom: function()
    {
      var messagesEl = this.$id('messages')[0];

      return Math.abs(messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight) < 5;
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
