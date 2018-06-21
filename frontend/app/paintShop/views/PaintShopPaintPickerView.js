// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/paintShop/templates/paintPicker'
], function(
  t,
  time,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'paintShop-paintPicker-dialog',

    events: {
      'focus [data-vkb]': function(e)
      {
        if (this.options.vkb)
        {
          this.options.vkb.show(e.target, this.onVkbValueChange);
        }
      },
      'click .paintShop-paintPicker-paint': function(e)
      {
        this.$('.active').removeClass('active');
        e.currentTarget.classList.add('active');
      },
      'input #-filter': 'onVkbValueChange',
      'submit': function()
      {
        return false;
      },
      'click #-select': function()
      {
        this.trigger('picked', this.$('.active').val());
      },
      'click #-msp': function()
      {
        this.trigger('picked', 'msp');
      },
      'click #-all': function()
      {
        this.trigger('picked', 'all');
      }
    },

    initialize: function()
    {
      this.onVkbValueChange = this.onVkbValueChange.bind(this);
    },

    destroy: function()
    {
      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }
    },

    getTemplateData: function()
    {
      var orders = this.model;
      var nc12s = {};
      var paints = [];

      orders.serialize().forEach(function(order)
      {
        Object.keys(order.paints).forEach(function(nc12)
        {
          nc12s[nc12] = 1;
        });
      });

      Object.keys(nc12s).forEach(function(nc12)
      {
        var paint = orders.paints.get(nc12);

        paints.push({
          nc12: nc12,
          name: paint ? paint.get('name') : ''
        });
      });

      paints.sort(function(a, b)
      {
        return a.nc12.localeCompare(b.nc12);
      });

      return {
        paints: paints
      };
    },

    afterRender: function()
    {
      var $paint = this.$('.paintShop-paintPicker-paint[value="' + this.model.selectedPaint + '"]');

      if (!$paint.length)
      {
        $paint = this.$('.paintShop-paintPicker-paint').first();
      }

      $paint.click().focus();

      this.$id('filter').focus();

      var height = window.innerHeight
        - this.$('.paintShop-paintPicker-filter').outerHeight()
        - this.$('.paintShop-paintPicker-buttons').outerHeight()
        - 4 * 15
        - 60;

      this.$('.paintShop-paintPicker-paints').css('height', height + 'px');
    },

    onVkbValueChange: function()
    {
      var filter = this.$id('filter').val().trim();

      if (filter === '')
      {
        this.$('.hidden').removeClass('hidden');
      }
      else
      {
        var first = null;

        this.$('.paintShop-paintPicker-paint').each(function()
        {
          var hidden = this.value.indexOf(filter) === -1;

          this.classList.toggle('hidden', hidden);

          if (!first && !hidden)
          {
            first = this;
          }
        });

        if (first)
        {
          first.click();
        }
      }
    }

  });
});
