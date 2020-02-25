// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  '../View',
  'app/core/templates/messages',
  'app/core/templates/message'
], function(
  _,
  $,
  t,
  View,
  messagesTemplate,
  messageTemplate
) {
  'use strict';

  var LOADING_MESSAGE_DELAY = 0;
  var SAVING_MESSAGE_DELAY = 0;

  var MessagesView = View.extend({

    template: messagesTemplate,

    events: {
      'click .message': function(e)
      {
        if (e.currentTarget.parentNode === this.el && e.currentTarget.getAttribute('data-view') === this.idPrefix)
        {
          this.hide($(e.currentTarget));
        }
      }
    },

    localTopics: {
      'router.executing': function()
      {
        this.hide();
      }
    }

  });

  MessagesView.prototype.initialize = function()
  {
    /**
     * @private
     * @type {jQuery|null}
     */
    this.$loadingMessage = null;

    /**
     * @private
     * @type {jQuery|null}
     */
    this.$savingMessage = null;

    /**
     * @private
     * @type {number|null}
     */
    this.loadingTimer = null;

    /**
     * @private
     * @type {number}
     */
    this.loadingCounter = 0;

    /**
     * @private
     * @type {number|null}
     */
    this.savingTimer = null;

    /**
     * @private
     * @type {number}
     */
    this.savingCounter = 0;

    /**
     * @private
     * @type {Array.<number>}
     */
    this.hideTimers = [];

    /**
     * @type {function}
     */
    this.loading = this.loading.bind(this);

    /**
     * @type {function}
     */
    this.loaded = this.loaded.bind(this);

    /**
     * @type {function}
     */
    this.saving = this.saving.bind(this);

    /**
     * @type {function}
     */
    this.saved = this.saved.bind(this);
  };

  MessagesView.prototype.destroy = function()
  {
    this.$loadingMessage = null;

    if (this.loadingTimer !== null)
    {
      clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }

    this.$savingMessage = null;

    if (this.savingTimer !== null)
    {
      clearTimeout(this.savingTimer);
      this.savingTimer = null;
    }

    if (this.hideTimers.length > 0)
    {
      this.hideTimers.forEach(clearTimeout);
      this.hideTimers = null;
    }

    this.$('.message[data-view="' + this.idPrefix + '"]').remove();
  };

  /**
   * @param {Object} options
   * @returns {jQuery}
   */
  MessagesView.prototype.show = function(options)
  {
    var $message = $(messageTemplate({
      className: options.className || '',
      type: options.type || 'info',
      text: options.text,
      sticky: !!options.sticky
    }));

    this.$el.append($message.attr('data-view', this.idPrefix));

    this.moveDown($message);

    $message
      .attr('data-top', $message.position().top)
      .css('margin-left', -($message.width() / 2) + 'px');

    if (options.immediate)
    {
      $message.css('opacity', 1);
    }
    else
    {
      $message.animate({opacity: 1});
    }

    this.scheduleHiding($message, options.time);

    return $message;
  };

  /**
   * @param {jQuery} [$message]
   * @param {boolean} [immediate]
   */
  MessagesView.prototype.hide = function($message, immediate)
  {
    if (!$message)
    {
      $message = this.$('.message[data-view="' + this.idPrefix + '"]:not(.message-sticky)');

      this.$loadingMessage = null;
    }
    else if ($message.hasClass('message-hiding'))
    {
      return;
    }
    else
    {
      $message.addClass('message-hiding');
    }

    if ($message.length === 1)
    {
      this.moveUp($message);
      this.removeHideTimer($message);
    }

    if (immediate)
    {
      $message.remove();
    }
    else
    {
      $message.animate({opacity: 0}, function()
      {
        $message.remove();
      });
    }
  };

  MessagesView.prototype.loading = function()
  {
    this.loadingCounter += 1;

    if (this.loadingTimer === null)
    {
      this.loadingTimer = setTimeout(
        this.showLoadingMessage.bind(this),
        LOADING_MESSAGE_DELAY
      );
    }
  };

  MessagesView.prototype.loaded = function()
  {
    this.hideLoadingMessage();
  };

  /**
   * @param {string} [text]
   */
  MessagesView.prototype.loadingFailed = function(text)
  {
    this.hideLoadingMessage();

    this.show({
      type: 'error',
      time: 10000,
      text: _.isString(text) ? text : t('core', 'MSG:LOADING_FAILURE')
    });
  };

  /**
   * @private
   */
  MessagesView.prototype.showLoadingMessage = function()
  {
    this.loadingTimer = null;

    if (this.$loadingMessage !== null)
    {
      return;
    }

    this.$loadingMessage = this.show({
      type: 'warning',
      text: t('core', 'MSG:LOADING'),
      immediate: true
    });
  };

  /**
   * @private
   */
  MessagesView.prototype.hideLoadingMessage = function()
  {
    if (this.loadingCounter > 0)
    {
      --this.loadingCounter;
    }

    if (this.loadingCounter !== 0)
    {
      return;
    }

    if (this.loadingTimer !== null)
    {
      clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }

    if (this.$loadingMessage !== null)
    {
      this.hide(this.$loadingMessage);
      this.$loadingMessage = null;
    }
  };

  MessagesView.prototype.saving = function()
  {
    this.savingCounter += 1;

    if (this.savingTimer === null)
    {
      this.savingTimer = setTimeout(
        this.showSavingMessage.bind(this),
        SAVING_MESSAGE_DELAY
      );
    }
  };

  MessagesView.prototype.saved = function()
  {
    this.hideSavingMessage();
  };

  /**
   * @param {string} [text]
   */
  MessagesView.prototype.savingFailed = function(text)
  {
    this.hideSavingMessage();

    this.show({
      type: 'error',
      time: 5000,
      text: _.isString(text) ? text : t('core', 'MSG:SAVING_FAILURE')
    });
  };

  /**
   * @private
   */
  MessagesView.prototype.showSavingMessage = function()
  {
    this.savingTimer = null;

    if (this.$savingMessage !== null)
    {
      return;
    }

    this.$savingMessage = this.show({
      type: 'warning',
      text: t('core', 'MSG:SAVING'),
      immediate: true
    });
  };

  /**
   * @private
   */
  MessagesView.prototype.hideSavingMessage = function()
  {
    if (this.savingCounter > 0)
    {
      --this.savingCounter;
    }

    if (this.savingCounter !== 0)
    {
      return;
    }

    if (this.savingTimer !== null)
    {
      clearTimeout(this.savingTimer);
      this.savingTimer = null;
    }

    if (this.$savingMessage !== null)
    {
      this.hide(this.$savingMessage);
      this.$savingMessage = null;
    }
  };

  /**
   * @private
   * @param {jQuery} $newMessage
   */
  MessagesView.prototype.moveDown = function($newMessage)
  {
    this.moveTopBy(
      this.$('.message[data-view="' + this.idPrefix + '"]'),
      $newMessage,
      this.getMoveOffset($newMessage)
    );
  };

  MessagesView.prototype.moveUp = function($removedMessage)
  {
    this.moveTopBy(
      $removedMessage.prevAll('.message'),
      $removedMessage,
      -this.getMoveOffset($removedMessage)
    );
  };

  MessagesView.prototype.moveTopBy = function($messages, $skipMessage, offset)
  {
    $messages.each(function()
    {
      if (this === $skipMessage[0])
      {
        return;
      }

      var $message = $(this);
      var top = parseInt($message.attr('data-top'), 10) + offset;

      $message.attr('data-top', top);
      $message.animate({top: top + 'px'});
    });
  };

  /**
   * @private
   * @param {jQuery} $message
   * @returns {number}
   */
  MessagesView.prototype.getMoveOffset = function($message)
  {
    return $message.outerHeight() + 8;
  };

  /**
   * @private
   * @param {jQuery} $message
   * @param {number} time
   */
  MessagesView.prototype.scheduleHiding = function($message, time)
  {
    if (!_.isNumber(time))
    {
      return;
    }

    if (time < 1000)
    {
      time = 1000;
    }

    var hideTimer = setTimeout(this.hide.bind(this, $message), time);

    $message.data('hideTimer', hideTimer);

    this.hideTimers.push(hideTimer);
  };

  /**
   * @private
   * @param {jQuery} $message
   */
  MessagesView.prototype.removeHideTimer = function($message)
  {
    var hideTimer = $message.data('hideTimer');

    if (_.isUndefined(hideTimer))
    {
      return;
    }

    clearTimeout(hideTimer);

    $message.data('hideTimer', undefined);

    this.hideTimers.splice(this.hideTimers.indexOf(hideTimer), 1);
  };

  return MessagesView;
});
