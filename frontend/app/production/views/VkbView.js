// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/production/templates/vkb'
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
      'focus .btn[data-key]': function(e)
      {
        this.trigger('keyFocused', e.currentTarget.dataset.key);
      },
      'click .btn[data-key]': function(e)
      {
        this.pressKey(e.currentTarget.dataset.key);
      }
    },

    initialize: function()
    {
      this.fieldEl = null;

      this.onValueChange = null;

      this.mode = {
        alpha: false,
        numeric: true,
        negative: false,
        multiline: false
      };

      $(window).on('resize.' + this.idPrefix, _.debounce(this.reposition.bind(this), 30));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      this.fieldEl = null;
      this.onValueChange = null;
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        mode: this.mode
      };
    },

    reposition: function()
    {
      if (!this.fieldEl)
      {
        return;
      }

      var vkbCss = {
        top: '',
        right: '',
        bottom: '',
        left: ''
      };
      var modalCss = {
        marginLeft: ''
      };
      var $vkb = this.$el;
      var $modal = $('.modal-dialog');

      $vkb.css(vkbCss);
      $modal.css(modalCss);

      var modalPos = $modal.offset();
      var modalW = $modal.outerWidth();
      var modalH = $modal.outerHeight();
      var vkbPos = $vkb.offset();
      var vkbW = $vkb.outerWidth();
      var overlapV = modalPos.top + modalH + 30 > vkbPos.top;
      var overlapH = modalPos.left + modalW + 30 > vkbPos.left;

      if (overlapV && this.mode.numeric && !this.mode.alpha)
      {
        vkbCss.top = this.fieldEl.getBoundingClientRect().top + 'px';
        vkbCss.left = modalPos.left + modalW + 30;
        vkbCss.bottom = 'auto';
        vkbCss.right = 'auto';
      }
      else if (overlapV && overlapH && this.mode.alpha && window.innerWidth > 800)
      {
        modalCss.marginLeft = Math.max(30, window.innerWidth - 30 - vkbW - 30 - modalW) + 'px';
      }

      $vkb.toggleClass('is-repositioned', overlapV).css(vkbCss);
      $modal.css(modalCss);
    },

    show: function(fieldEl, onValueChange)
    {
      var view = this;

      if (view.fieldEl === fieldEl && view.onValueChange === onValueChange)
      {
        return false;
      }

      Object.keys(this.mode).forEach(function(mode) { view.mode[mode] = false; });

      (fieldEl.dataset.vkb || '').split(' ').forEach(function(mode) { view.mode[mode] = true; });

      view.render();

      view.$el.removeClass('is-repositioned hidden');

      $('.is-vkb-focused').removeClass('is-vkb-focused');

      fieldEl.classList.add('is-vkb-focused');

      view.fieldEl = fieldEl;
      view.onValueChange = onValueChange;

      view.reposition();

      return true;
    },

    hide: function()
    {
      $('.modal-dialog').css('margin-left', '');

      this.$el.addClass('hidden');

      if (this.fieldEl)
      {
        this.fieldEl.classList.remove('is-vkb-focused');
      }

      this.fieldEl = null;
      this.onValueChange = null;
    },

    isVisible: function()
    {
      return !this.$el.hasClass('hidden');
    },

    enableKeys: function()
    {
      this.$('.btn[data-key][disabled]').each(function()
      {
        this.disabled = false;
      });
    },

    disableKeys: function(keys)
    {
      this.$('.btn[data-key]').each(function()
      {
        if (this.dataset.key.length === 1)
        {
          this.disabled = keys[this.dataset.key] !== true;
        }
      });
    },

    pressKey: function(key)
    {
      var fieldEl = this.fieldEl;

      if (!fieldEl)
      {
        return;
      }

      var value = fieldEl.value;
      var start = fieldEl.selectionStart;
      var end = fieldEl.selectionEnd;

      if (key === 'ENTER')
      {
        key = '\n';
      }
      else if (key === 'SPACE')
      {
        key = ' ';
      }

      if (key === 'CLEAR')
      {
        start = 0;
        value = '';
      }
      else if (key === 'BACKSPACE')
      {
        start -= 1;
        value = value.substring(0, start) + value.substring(end);
      }
      else if (key === 'LEFT')
      {
        start -= 1;
      }
      else if (key === 'RIGHT')
      {
        start += 1;
      }
      else if (!fieldEl.maxLength || fieldEl.maxLength === -1 || value.length < fieldEl.maxLength)
      {
        value = value.substring(0, start) + key + value.substring(end);
        start += 1;
      }

      var valueChanged = fieldEl.value !== value;

      fieldEl.value = value;
      fieldEl.focus();
      fieldEl.setSelectionRange(start, start);

      if (valueChanged && this.onValueChange)
      {
        this.onValueChange(fieldEl);
      }
    }

  });
});
