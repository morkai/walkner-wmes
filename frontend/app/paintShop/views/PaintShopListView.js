// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/paintShop/templates/list'
], function(
  _,
  $,
  t,
  time,
  viewport,
  View,
  listTemplate
) {
  'use strict';

  return View.extend({

    template: listTemplate,

    events: {
      'mousedown .paintShop-list-item': function(e)
      {
        this.lastClickEvent = e;
      },
      'mouseup .paintShop-list-item': function(e)
      {
        var lastE = this.lastClickEvent;

        if (!lastE || e.button !== 0)
        {
          return;
        }

        if (window.parent === window
          || (lastE.offsetY === e.offsetY
          && lastE.offsetX === e.offsetX
          && lastE.screenX === e.screenX
          && lastE.screenY === e.screenY))
        {
          this.handleItemClick(e.currentTarget.dataset.orderId);
        }

        this.lastClickEvent = null;
      },
      'scroll': 'onScroll',
      'focus #-search': function(e)
      {
        if (this.options.vkb)
        {
          clearTimeout(this.timers.hideVkb);

          this.options.vkb.show(e.target, this.onVkbValueChange);
          this.options.vkb.$el.css({
            left: '195px',
            bottom: '67px',
            marginLeft: '0'
          });
        }
      },
      'blur #-search': function()
      {
        if (this.options.vkb)
        {
          this.scheduleHideVkb();
        }
      },
      'input #-search': 'onVkbValueChange'
    },

    initialize: function()
    {
      this.lastClickEvent = null;
      this.lastVisibleItem = null;
      this.onScroll = _.debounce(this.onScroll.bind(this), 100, false);
      this.onVkbValueChange = this.onVkbValueChange.bind(this);

      this.listenTo(this.model, 'reset', this.render);
      this.listenTo(this.model, 'change', this.onChange);
      this.listenTo(this.model, 'mrpSelected', this.onMrpSelected);
    },

    destroy: function()
    {
      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        showTimes: this.options.showTimes,
        showSearch: this.options.showSearch,
        selectedMrp: this.model.selectedMrp,
        orders: this.serializeOrders()
      };
    },

    serializeOrders: function()
    {
      var filter = this.options.filter;
      var sort = this.options.sort;
      var orders = this.model.serialize();

      if (filter)
      {
        orders = orders.filter(filter);
      }

      if (sort)
      {
        orders = orders.sort(sort);
      }

      return orders;
    },

    afterRender: function()
    {
      var $visible = this.$item(this.lastVisibleItem);

      if ($visible.length)
      {
        this.el.scrollTop = $visible[0].offsetTop;
      }
    },

    $item: function(orderId)
    {
      return this.$('.paintShop-list-item[data-order-id="' + orderId + '"]');
    },

    handleItemClick: function(orderId)
    {
      if (orderId)
      {
        this.model.trigger('focus', orderId);
      }
    },

    scheduleHideVkb: function()
    {
      var view = this;

      clearTimeout(view.timers.hideVkb);

      if (!view.options.vkb.isVisible())
      {
        return;
      }

      view.timers.hideVkb = setTimeout(function()
      {
        view.options.vkb.hide();
        view.options.vkb.$el.css({
          left: '',
          bottom: '',
          marginLeft: ''
        });

        view.$id('search').val('').addClass('is-empty').css('background', '');
      }, 250);
    },

    searchOrder: function(orderNo)
    {
      var view = this;

      if (view.options.vkb)
      {
        view.options.vkb.hide();
      }

      var $search = view.$id('search').blur();
      var order = view.model.getFirstByOrderNo(orderNo);

      if (order)
      {
        $search.val('').addClass('is-empty').css('background', '');

        if (order.get('mrp') !== view.model.selectedMrp)
        {
          view.model.selectMrp(order.get('mrp'));
        }

        view.model.trigger('focus', order.id);

        return;
      }

      $search.prop('disabled', true);

      viewport.msg.loading();

      var req = this.ajax({
        url: '/paintShop/orders?order=' + orderNo + '&select(date,mrp)&limit(1)'
      });

      req.fail(fail);

      req.done(function(res)
      {
        if (res.totalCount === 0)
        {
          return fail();
        }

        var order = res.collection[0];

        view.model.setDateFilter(time.utc.format(order.date, 'YYYY-MM-DD'));

        var req = view.model.fetch({reset: true});

        req.fail(fail);

        req.done(function()
        {
          if (view.model.selectedMrp !== order.mrp)
          {
            view.model.selectMrp(order.mrp);
            view.model.trigger('focus', order._id);
          }
        });
      });

      req.always(function()
      {
        viewport.msg.loaded();
      });

      function fail()
      {
        viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: t('paintShop', 'MSG:search:failure')
        });

        $search.css('background', '#f2dede');

        setTimeout(function()
        {
          $search
            .prop('disabled', false)
            .val('')
            .addClass('is-empty')
            .css('background', '')
            .focus();
        }, 1337);
      }
    },

    onVkbValueChange: function()
    {
      var $search = this.$id('search');
      var orderNo = $search.val();

      $search.toggleClass('is-empty', orderNo === '').css('background', /[^0-9]+/.test(orderNo) ? '#f2dede' : '');

      if (/^[0-9]{9}$/.test(orderNo))
      {
        this.searchOrder(orderNo);
      }
    },

    onScroll: function()
    {
      var $visible = this.$('.visible');

      if (!$visible.length)
      {
        return;
      }

      this.lastVisibleItem = $visible[0].dataset.orderId;

      var scrollTop = this.el.scrollTop;

      for (var i = 0; i < $visible.length; ++i)
      {
        var el = $visible[i];

        if (el.offsetTop > scrollTop)
        {
          break;
        }

        this.lastVisibleItem = el.dataset.orderId;

        if (scrollTop > el.offsetTop + 25 && $visible[i + 1])
        {
          this.lastVisibleItem = $visible[i + 1].dataset.orderId;
        }
      }
    },

    onChange: function(order)
    {
      var $item = this.$item(order.id);

      if (!this.options.filter)
      {
        $item.attr('data-status', order.get('status'));

        return;
      }

      if ($item.length || this.options.filter(order.serialize()))
      {
        this.render();
      }
    },

    onMrpSelected: function()
    {
      var selectedMrp = this.model.selectedMrp;
      var specificMrp = selectedMrp !== 'all';

      this.$('.paintShop-list-item').each(function()
      {
        var hidden = specificMrp && this.dataset.mrp !== selectedMrp;

        if (this.nextElementSibling)
        {
          this.classList.toggle('hidden', hidden);
          this.classList.toggle('visible', !hidden);
        }
      });
    }

  });
});
