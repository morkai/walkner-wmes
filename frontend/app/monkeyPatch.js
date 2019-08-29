// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'backbone',
  'bootstrap',
  'select2'
],
function(
  $,
  Backbone
) {
  'use strict';

  var originalSync = Backbone.sync;

  Backbone.sync = function(method, model, options)
  {
    options.syncMethod = method;

    return originalSync.call(this, method, model, options);
  };

  $.fn.modal.Constructor.prototype.enforceFocus = function() {};

  $.fn.modal.Constructor.prototype.escape = function()
  {
    if (this.isShown && this.options.keyboard)
    {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function(e)
      {
        if (e.which === 27 && !this.$element.hasClass('modal-no-keyboard'))
        {
          this.hide();
        }
      }, this));
    }
    else if (!this.isShown)
    {
      this.$element.off('keydown.dismiss.bs.modal');
    }
  };

  $.fn.modal.Constructor.prototype.backdrop = function(callback)
  {
    var that = this;
    var animate = that.$element.hasClass('fade') ? 'fade' : '';

    if (that.isShown && that.options.backdrop)
    {
      var doAnimate = $.support.transition && animate;

      that.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .prependTo(that.$element)
        .on('click.dismiss.bs.modal', function(e)
        {
          if (e.target !== e.currentTarget)
          {
            return;
          }

          if (that.options.backdrop === 'static' || that.$element.hasClass('modal-static'))
          {
            that.$element[0].focus.call(that.$element[0]);
          }
          else
          {
            that.hide.call(that);
          }
        });

      if (doAnimate)
      {
        that.$backdrop[0].offsetWidth; // eslint-disable-line no-unused-expressions
      }

      that.$backdrop.addClass('in');

      if (!callback)
      {
        return;
      }

      if (doAnimate)
      {
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd($.fn.modal.Constructor.BACKDROP_TRANSITION_DURATION);
      }
      else
      {
        callback();
      }
    }
    else if (!that.isShown && that.$backdrop)
    {
      that.$backdrop.removeClass('in');

      var callbackRemove = function()
      {
        that.removeBackdrop();

        if (callback)
        {
          callback();
        }
      };

      if ($.support.transition && that.$element.hasClass('fade'))
      {
        that.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd($.fn.modal.Constructor.BACKDROP_TRANSITION_DURATION);
      }
      else
      {
        callbackRemove();
      }
    }
    else if (callback)
    {
      callback();
    }
  };

  $.fn.modal.Constructor.prototype.checkScrollbar = function()
  {
    this.bodyIsOverflowing = document.body.scrollHeight > document.documentElement.clientHeight
      || $(document.body).css('overflow-y') === 'scroll';
    this.scrollbarWidth = this.measureScrollbar();
  };

  $.fn.popover.Constructor.prototype.hasContent = function()
  {
    return this.options.hasContent === true || !!this.getTitle() || !!this.getContent();
  };

  $.fn.popover.Constructor.prototype.tip = function()
  {
    if (!this.$tip)
    {
      var template = this.options.template;

      if (typeof template === 'function')
      {
        template = template.call(this.$element[0], $.fn.popover.Constructor.DEFAULTS.template);
      }

      this.$tip = typeof template === 'string' ? $(template) : template;

      if (this.options.css)
      {
        this.$tip.css(this.options.css);
      }

      if (this.options.className)
      {
        this.$tip.addClass(this.options.className);
      }
    }

    return this.$tip;
  };

  $.fn.popover.Constructor.prototype.getTitle = function()
  {
    var $e = this.$element;
    var o = this.options;

    if (o.title)
    {
      return typeof o.title === 'function' ? o.title.call($e[0]) : o.title;
    }

    return $e.attr('data-original-title') || '';
  };

  var $body = $(document.body);

  $.fn.select2.defaults.dropdownContainer = function(select2)
  {
    var $modalBody = select2.container.closest('.modal-body');

    if ($modalBody.length === 0)
    {
      return $body;
    }

    var $modalDialog = $modalBody.closest('.modal-dialog');

    return $modalDialog.length === 0 ? $body : $modalDialog;
  };

  $body.on('click', 'label[for]', function(e)
  {
    var $el = $('#' + e.currentTarget.htmlFor);

    if ($el.data('select2') && !$el.parent().hasClass('has-required-select2'))
    {
      $el.select2('focus');
    }
  });

  return {};
});
