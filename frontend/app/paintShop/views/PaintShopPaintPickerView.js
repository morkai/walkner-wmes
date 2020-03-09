// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/paintShop/templates/paintPicker'
], function(
  $,
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

    modelProperty: 'orders',

    initialize: function()
    {
      this.onVkbValueChange = this.onVkbValueChange.bind(this);

      $(window).on('resize.' + this.idPrefix, this.resize.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }
    },

    getTemplateData: function()
    {
      var orders = this.orders;
      var dropZones = this.dropZones;
      var nc12s = {};
      var paints = [];
      var weights = {};
      var manHours = {};

      orders.serialize().forEach(function(order)
      {
        Object.keys(order.paints).forEach(function(nc12)
        {
          nc12s[nc12] = 1;
        });

        order.childOrders.forEach(function(childOrder)
        {
          var paintCount = 0;

          childOrder.components.forEach(function(component)
          {
            paintCount += component.unit !== 'G' && component.unit !== 'KG' ? 0 : 1;
          });

          childOrder.components.forEach(function(component)
          {
            if (component.unit !== 'G' && component.unit !== 'KG')
            {
              return;
            }

            if (!weights[component.nc12])
            {
              weights[component.nc12] = 0;
              manHours[component.nc12] = 0;
            }

            weights[component.nc12] += component.qty;
            manHours[component.nc12] += childOrder.manHours / paintCount;
          });
        });
      });

      var mspPaints = orders.settings.getValue('mspPaints') || [];

      Object.keys(nc12s).forEach(function(nc12)
      {
        if (mspPaints.indexOf(nc12) !== -1)
        {
          return;
        }

        var paint = orders.paints.get(nc12);
        var totals = orders.totalQuantities[nc12];
        var remaining = !totals ? 0 : (totals.new + totals.started + totals.partial);

        paints.push({
          nc12: nc12,
          name: paint ? paint.get('name') : '',
          dropped: dropZones.getState(nc12),
          totals: totals,
          remaining: remaining,
          weight: weights[nc12] || 0,
          manHours: Math.round((manHours[nc12] || 0) * 100) / 100,
          className: !totals || remaining === 0 ? 'success' : 'default'
        });
      });

      paints.sort(function(a, b)
      {
        if (a.remaining === b.remaining)
        {
          return a.nc12.localeCompare(b.nc12);
        }

        return b.remaining - a.remaining;
      });

      return {
        paints: paints,
        mspDropped: dropZones.getState('msp')
      };
    },

    afterRender: function()
    {
      this.resize();

      var $paint = this.$('.paintShop-paintPicker-paint[value="' + this.orders.selectedPaint + '"]');

      if (!$paint.length)
      {
        $paint = this.$('.paintShop-paintPicker-paint').first();
      }

      $paint.click().focus();

      this.$id('filter').focus();
    },

    resize: function()
    {
      var height = window.innerHeight
        - this.$('.paintShop-paintPicker-filter').outerHeight()
        - this.$('.paintShop-paintPicker-buttons').outerHeight()
        - 4 * 15
        - 62;

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
