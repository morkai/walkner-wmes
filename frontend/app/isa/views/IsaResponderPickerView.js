// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/user',
  'app/core/View',
  'app/isa/templates/responderPicker'
], function(
  $,
  t,
  viewport,
  user,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .list-group-item': function()
      {
        return false;
      },
      'keydown': function(e)
      {
        switch (e.keyCode)
        {
          case 13: // enter
          case 32: // space
            this.pick(e.target);
            break;

          case 37: // left
            if (this.el.firstElementChild)
            {
              this.el.firstElementChild.focus();
            }
            break;

          case 38: // up
            if (e.target.previousElementSibling)
            {
              e.target.previousElementSibling.focus();
            }
            else if (this.el.lastElementChild)
            {
              this.el.lastElementChild.focus();
            }
            break;

          case 39: // right
            if (this.el.lastElementChild)
            {
              this.el.lastElementChild.focus();
            }
            break;

          case 40: // down
            if (e.target.nextElementSibling)
            {
              e.target.nextElementSibling.focus();
            }
            else if (this.el.firstElementChild)
            {
              this.el.firstElementChild.focus();
            }
            break;
        }

        var lineStateEl = this.el.children[e.keyCode - 49];

        if (lineStateEl)
        {
          this.pick(lineStateEl);
        }
      },
      'mouseenter': function()
      {
        clearTimeout(this.timers.hide);
      },
      'mouseleave': function()
      {
        this.timers.hide = setTimeout(this.pick.bind(this, null), 10000);
      }
    },

    initialize: function()
    {
      var view = this;

      $(document.body).on('mousedown.' + this.idPrefix, function(e)
      {
        view.pick(e.target);
      });
      $(document.body).on('keydown.' + this.idPrefix, function(e)
      {
        if (e.keyCode === 9)
        {
          if (view.el.firstElementChild)
          {
            view.el.firstElementChild.focus();
          }

          return false;
        }
        else if (e.keyCode === 27)
        {
          view.pick(null);
        }
      });
    },

    destroy: function()
    {
      $(document.body).off('.' + this.idPrefix);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        users: this.model.serializeUsers(this.options.includeSelf)
      };
    },

    afterRender: function()
    {
      var $first = this.$el.children().first().focus();

      if (!$first.length)
      {
        viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: t('isa', 'responderPicker:empty')
        });
      }
    },

    show: function($parent, selected)
    {
      if (!this.el.classList.contains('isa-responderPicker'))
      {
        this.render().$el.css('left', '-1000px').appendTo($parent);

        var parentPosition = $parent.position();
        var parentWidth = $parent.outerWidth();

        this.$el.css({
          display: 'none',
          top: (parentPosition.top - 1) + 'px',
          left: (parentPosition.left + parentWidth - this.$el.outerWidth() + 1) + 'px'
        });
      }

      this.$el.stop(true, false).fadeIn({
        duration: 'fast',
        start: function()
        {
          var userEl = this.querySelector('[data-user-id="' + selected || user.data._id + '"]');

          if (userEl)
          {
            userEl.focus();
          }
          else if (this.firstElementChild)
          {
            this.firstElementChild.focus();
          }
        }
      });
    },

    hide: function()
    {
      this.$el.stop(true, false).fadeOut('fast', this.remove.bind(this));
    },

    pick: function(el)
    {
      if (el && el.tagName === 'SPAN')
      {
        el = el.parentNode;
      }

      this.trigger('picked', !el || !el.dataset.userId ? null : {
        id: el.dataset.userId,
        label: el.querySelector('span').textContent
      });
    }

  });
});
