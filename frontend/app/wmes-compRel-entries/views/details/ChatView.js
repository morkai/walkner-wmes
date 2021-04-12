// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'getCaretCoordinates',
  'app/user',
  'app/socket',
  'app/core/View',
  'app/planning/util/contextMenu',
  'app/wmes-fap-entries/views/NavbarView',
  'app/wmes-compRel-entries/templates/details/chat',
  'app/wmes-compRel-entries/templates/details/chatMessage'
], function(
  _,
  $,
  getCaretCoordinates,
  user,
  socket,
  View,
  contextMenu,
  NavbarView,
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
        var empty = e.target.value.trim() === '';

        if (whitespace && empty)
        {
          this.toggleMultiLine();

          return false;
        }

        if (!this.multiLine && enter && e.shiftKey && !empty)
        {
          this.toggleMultiLine(true);

          return;
        }

        if (this.multiLine && enter && e.shiftKey)
        {
          this.send();

          return false;
        }

        if (!this.multiLine && enter && !e.shiftKey)
        {
          this.send();

          return false;
        }
      },
      'input #-send': function()
      {
        this.resizeSend();
      },
      'click #-new': function()
      {
        var $messages = this.$id('messages');

        this.$id('new').addClass('hidden');

        $messages.animate({scrollTop: $messages[0].scrollHeight}, 'fast');
      },
      'click .compRel-chat-attachment': function(e)
      {
        this.model.trigger('focusAttachment', e.currentTarget.dataset.attachmentId);
      },
      'click #-submit': function()
      {
        this.send();
      },
      'mouseup .autolink': function(e)
      {
        var id = e.currentTarget.dataset.id;

        if (e.button === 1)
        {
          switch (e.currentTarget.dataset.type)
          {
            case 'order':
              window.open('/#orders/' + id);
              break;

            case 'product':
              window.open('/r/nc12/' + id);
              break;

            case 'document':
              if (user.isAllowedTo('DOCUMENTS:VIEW'))
              {
                window.open('/#orderDocuments/tree?file=' + id);
              }
              else
              {
                window.open('/orderDocuments/' + id);
              }
              break;
          }
        }
        else if (NavbarView.appNavbarView)
        {
          this.showAutolinkMenu(e);
        }
        else
        {
          $('.navbar-search-phrase').first().val(id).focus();
        }

        return false;
      }

    },

    initialize: function()
    {
      this.chatScrollTop = -1;
      this.multiLine = false;

      this.listenTo(this.model, 'change:changes', this.onChange);
    },

    getTemplateData: function()
    {
      return {
        chat: this.model.serializeChat(),
        renderMessage: this.renderPartialHtml.bind(this, messageTemplate)
      };
    },

    afterRender: function()
    {
      var $messages = this.$id('messages');

      if ($messages.length)
      {
        $messages[0].scrollTop = this.chatScrollTop === -1 ? 9999999 : this.chatScrollTop;

        $messages.on('scroll', this.onScroll.bind(this));
      }

      this.toggleMultiLine(this.multiLine);
    },

    toggleMultiLine: function(multiLine)
    {
      this.multiLine = typeof multiLine === 'boolean' ? multiLine : !this.multiLine;

      this.$el.toggleClass('compRel-chat-multiLine', this.multiLine);

      if (this.multiLine)
      {
        this.$id('submit')[0].style.marginLeft = (this.$id('submit').outerWidth() / 2 * -1) + 'px';
      }
    },

    send: function()
    {
      var view = this;
      var $send = view.$id('send');
      var comment = $send.val().trim();
      var data = {};

      $send.val('');

      view.toggleMultiLine(false);
      view.resizeSend();

      view.model.handleChange({
        date: new Date(),
        user: user.getInfo(),
        data: data,
        comment: comment
      });

      view.model.update({comment: comment});
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
        var $lines = $lastMessage.find('.compRel-chat-lines');

        message.lines.forEach(function(line)
        {
          $('<div class="compRel-chat-line"></div>')
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
        view.$('.compRel-chat-attachment[data-attachment-id="' + a._id + '"]').css('text-decoration', 'line-through');
      });
    },

    isScrolledToBottom: function()
    {
      var messagesEl = this.$id('messages')[0];

      return Math.abs(messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight) < 5;
    },

    resizeSend: function()
    {
      var $messages = this.$id('messages');
      var $send = this.$id('send');
      var oldHeight = $send[0].offsetHeight;
      var minHeight = parseInt($send.css('minHeight'), 10);

      $send.outerHeight(minHeight);

      var scroll = false;
      var newHeight = Math.max(minHeight, $send[0].scrollHeight);

      if (newHeight > 215)
      {
        scroll = true;
        newHeight = 215;
      }

      var heightDiff = newHeight - oldHeight;

      $messages.css('height', 563 - newHeight);
      $send.outerHeight(newHeight).toggleClass('compRel-chat-send-scroll', scroll);

      if (heightDiff < 0 && this.isScrolledToBottom())
      {
        return;
      }

      $messages[0].scrollTop += newHeight - oldHeight;
    },

    onScroll: function(e)
    {
      this.chatScrollTop = e.target.scrollTop;

      if (this.isScrolledToBottom())
      {
        this.$id('new').addClass('hidden');
      }
    },

    showAutolinkMenu: function(e)
    {
      if (!NavbarView.appNavbarView)
      {
        return;
      }

      var $results = NavbarView.appNavbarView.renderSearchResults(
        NavbarView.appNavbarView.parseSearchPhrase(e.currentTarget.dataset.id)
      );

      while ($results.length)
      {
        var $last = $results.children().last();

        if ($last.hasClass('dropdown-header') || $last.hasClass('divider'))
        {
          $last.remove();
        }
        else
        {
          break;
        }
      }

      var menu = [];
      var groups = 0;

      $results.children().each(function()
      {
        if (groups > 1)
        {
          return;
        }

        if (this.classList.contains('navbar-search-result'))
        {
          menu.push({
            label: this.textContent,
            href: this.querySelector('a').href,
            handler: function() { window.open(this.href); }
          });

          return;
        }

        groups += 1;

        if (groups > 1)
        {
          return;
        }

        if (this.classList.contains('dropdown-header'))
        {
          menu.push(this.textContent);
        }
        else if (this.classList.contains('divider'))
        {
          menu.push('-');
        }
      });

      contextMenu.show(this, e.pageY, e.pageX, menu);
    }

  });
});
