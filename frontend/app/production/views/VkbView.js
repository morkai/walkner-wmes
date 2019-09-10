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

  var LABELS = {
    BACKSPACE: '<i class="fa fa-long-arrow-left"></i>',
    LEFT: '<',
    RIGHT: '>',
    CLEAR: '<i class="fa fa-eraser"></i>'
  };

  return View.extend({

    template: template,

    events: {
      'focus .btn[data-key]': function(e)
      {
        this.trigger('keyFocused', e.currentTarget.dataset.key);
      },
      'click .btn[data-key]': function(e)
      {
        var key = e.currentTarget.dataset.key;
        var extendedKey = e.currentTarget.dataset.extendedKey;

        this.pressKey(extendedKey && this.extended && this.mode.extended ? extendedKey : key);
      }
    },

    initialize: function()
    {
      this.fieldEl = null;

      this.onValueChange = null;

      this.extended = false;

      this.mode = {
        alpha: false,
        numeric: true,
        negative: false,
        multiline: false,
        extended: false
      };

      $(window).on('resize.' + this.idPrefix, _.debounce(this.reposition.bind(this), 30));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      this.fieldEl = null;
      this.onValueChange = null;
    },

    getTemplateData: function()
    {
      return {
        mode: this.mode,
        extended: this.extended
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

      view.updateExtended();
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

      if (key === 'EXTENDED')
      {
        return this.toggleExtended();
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
    },

    toggleExtended: function()
    {
      this.extended = !this.extended;

      this.updateExtended();
    },

    updateExtended: function()
    {
      var extended = this.mode.extended && this.extended;

      this.$el.toggleClass('is-vkb-extended', extended);

      this.$('.btn[data-key="EXTENDED"]').toggleClass('active', extended);

      this.$('.btn[data-extended-key]').each(function()
      {
        var label = this.dataset[extended ? 'extendedKey' : 'key'];

        this.innerHTML = LABELS[label] || label;
      });
    }

  });
});
