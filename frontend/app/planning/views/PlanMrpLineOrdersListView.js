// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/data/clipboard',
  '../util/shift',
  '../util/contextMenu',
  'app/core/templates/userInfo',
  'app/planning/templates/lineOrdersList',
  'app/planning/templates/lineOrderComments'
], function(
  _,
  $,
  t,
  time,
  View,
  clipboard,
  shiftUtil,
  contextMenu,
  userInfoTemplate,
  lineOrdersListTemplate,
  lineOrderCommentsTemplate
) {
  'use strict';

  return View.extend({

    template: lineOrdersListTemplate,

    events: {
      'mouseenter tbody > tr': function(e)
      {
        this.mrp.orders.trigger('highlight', {
          source: 'lineOrders',
          state: true,
          orderNo: e.currentTarget.dataset.id
        });
      },
      'mouseleave tbody > tr': function(e)
      {
        this.mrp.orders.trigger('highlight', {
          source: 'lineOrders',
          state: false,
          orderNo: e.currentTarget.dataset.id
        });
      },
      'contextmenu tbody > tr': function(e)
      {
        this.showMenu(e);

        return false;
      },
      'dblclick tr': function(e)
      {
        window.getSelection().removeAllRanges();

        var trEl = e.currentTarget;
        var index = trEl.dataset.index;
        var offset = e.clientY - e.currentTarget.getBoundingClientRect().top;

        this.$el.toggleClass('is-expanded');

        this.expanded = this.$el.hasClass('is-expanded');

        if (this.expanded)
        {
          window.scrollTo(0, window.scrollY + trEl.getBoundingClientRect().top - e.clientY + offset);
        }
        else if (index >= 10)
        {
          window.scrollTo(0, this.$el.closest('.planning-mrp')[0].offsetTop);

          e.currentTarget.scrollIntoView({block: 'center'});

          window.scrollBy(0, (e.clientY - trEl.getBoundingClientRect().top - offset) * -1);
        }
      },
      'wheel': function(e)
      {
        if (this.expanded || e.target.classList.contains('no-scroll'))
        {
          window.scrollBy(e.originalEvent.deltaX, e.originalEvent.deltaY);
        }
        else
        {
          this.el.scrollBy(e.originalEvent.deltaX, e.originalEvent.deltaY);
        }

        return false;
      },
      'mousedown td.no-scroll': function(e)
      {
        if (e.button !== 0)
        {
          return;
        }

        var sapOrder = this.plan.sapOrders.get(e.currentTarget.parentNode.dataset.id);

        if (!sapOrder)
        {
          return;
        }

        var comments = sapOrder.get('comments');

        if (!comments.length)
        {
          return;
        }

        this.$(e.currentTarget).popover({
          trigger: 'manual',
          placement: 'left',
          html: true,
          content: lineOrderCommentsTemplate({
            comments: comments.map(function(comment)
            {
              return {
                user: userInfoTemplate({noIp: true, userInfo: comment.user}),
                time: time.toTagData(comment.time).human,
                text: comment.text.trim()
              };
            })
          }),
          template: '<div class="popover planning-mrp-comment-popover">'
            + '<div class="arrow"></div>'
            + '<div class="popover-content"></div>'
            + '</div>'
        }).popover('show');
      },
      'mouseup td.no-scroll': function(e)
      {
        this.$(e.currentTarget).popover('destroy');
      }
    },

    initialize: function()
    {
      var view = this;

      view.expanded = false;

      view.listenTo(view.mrp.lines, 'reset changed', view.renderIfNotLoading);

      view.listenTo(view.mrp.orders, 'highlight', view.onOrderHighlight);

      view.listenTo(view.plan.sapOrders, 'change:comment', view.onCommentChange);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        expanded: this.expanded,
        orders: this.serializeOrders()
      };
    },

    renderIfNotLoading: function()
    {
      if (!this.plan.isAnythingLoading())
      {
        this.render();
      }
    },

    serializeOrders: function()
    {
      var sapOrders = this.plan.sapOrders;
      var mrp = this.mrp;
      var map = {};

      mrp.lines.forEach(function(line)
      {
        line.orders.forEach(function(lineOrder)
        {
          var orderNo = lineOrder.get('orderNo');
          var order = mrp.orders.get(orderNo);

          if (!order)
          {
            return;
          }

          var sapOrder = sapOrders.get(orderNo);
          var item = map[orderNo];

          if (!item)
          {
            item = map[orderNo] = {
              orderNo: order.id,
              nc12: order.get('nc12'),
              name: order.get('name'),
              startTime: Number.MAX_VALUE,
              finishTime: 0,
              qtyTodo: order.get('quantityTodo'),
              qtyPlan: 0,
              lines: {},
              comment: sapOrder ? sapOrder.get('comment') : ''
            };
          }

          item.qtyPlan += lineOrder.get('quantity');

          var startTime = Date.parse(lineOrder.get('startAt'));

          if (startTime < item.startTime)
          {
            item.startTime = startTime;
          }

          var finishTime = Date.parse(lineOrder.get('finishAt'));

          if (finishTime > item.finishTime)
          {
            item.finishTime = finishTime;
          }

          if (!item.lines[line.id])
          {
            item.lines[line.id] = 0;
          }

          item.lines[line.id] += lineOrder.get('quantity');
        });
      });

      return _.values(map).sort(function(a, b) { return a.startTime - b.startTime; }).map(function(order, i)
      {
        order.no = i + 1;
        order.shift = shiftUtil.getShiftNo(order.startTime);
        order.startTime = time.utc.format(order.startTime, 'HH:mm:ss');
        order.finishTime = time.utc.format(order.finishTime, 'HH:mm:ss');
        order.lines = _.map(order.lines, function(qty, line) { return line + ' (' + qty + ')'; }).join('; ');

        return order;
      });
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showMenu: function(e)
    {
      var orderNo = e.currentTarget.dataset.id;
      var menu = [
        contextMenu.actions.sapOrder(orderNo)
      ];

      if (this.plan.shiftOrders.findOrders(orderNo).length
        || this.plan.getActualOrderData(orderNo).quantityDone)
      {
        menu.push({
          label: t('planning', 'orders:menu:shiftOrder'),
          handler: this.handleShiftOrderAction.bind(this, orderNo)
        });
      }

      if (this.plan.canCommentOrders())
      {
        menu.push(contextMenu.actions.comment(orderNo));
      }

      menu.push({
        label: t('planning', 'lineOrders:menu:copy'),
        handler: this.handleCopyAction.bind(this, e.currentTarget, e.pageY, e.pageX)
      });

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    handleShiftOrderAction: function(orderNo)
    {
      var shiftOrders = this.plan.shiftOrders.findOrders(orderNo);

      if (shiftOrders.length === 1)
      {
        return window.open('/#prodShiftOrders/' + shiftOrders[0].id);
      }

      window.open('/#prodShiftOrders?sort(startedAt)&limit(20)&orderId=' + orderNo);
    },

    handleCopyAction: function(el, y, x)
    {
      var view = this;

      clipboard.copy(function(clipboardData)
      {
        if (!clipboardData)
        {
          return;
        }

        var text = [
          ['no', 'shift', 'orderNo', 'nc12', 'name', 'qtyPlan', 'qtyTodo', 'startTime', 'finishTime', 'lines']
            .map(function(p) { return t('planning', 'lineOrders:list:' + p); })
            .join('\t')
        ];

        view.serializeOrders().forEach(function(order)
        {
          var row = [
            order.no,
            order.shift,
            order.orderNo,
            order.nc12,
            order.name,
            order.qtyPlan,
            order.qtyTodo,
            order.startTime,
            order.finishTime,
            order.lines
          ];

          text.push(row.join('\t'));
        });

        clipboardData.setData('text/plain', text.join('\r\n'));

        var $btn = view.$(el).tooltip({
          container: view.el,
          trigger: 'manual',
          placement: 'bottom',
          title: t('planning', 'lineOrders:menu:copy:success')
        });

        $btn.tooltip('show').data('bs.tooltip').tip().addClass('result success').css({
          left: x + 'px',
          top: y + 'px'
        });

        if (view.timers.hideTooltip)
        {
          clearTimeout(view.timers.hideTooltip);
        }

        view.timers.hideTooltip = setTimeout(function() { $btn.tooltip('destroy'); }, 1337);
      });
    },

    onOrderHighlight: function(message)
    {
      if (message.source === 'lineOrders' || !this.mrp.orders.get(message.orderNo))
      {
        return;
      }

      var trEl = this.$('tr[data-id="' + message.orderNo + '"]').toggleClass('is-highlighted', message.state)[0];

      if (trEl && !this.expanded)
      {
        this.el.scrollTop = trEl.offsetTop;
      }
    },

    onCommentChange: function(sapOrder)
    {
      if (this.mrp.orders.get(sapOrder.id))
      {
        this.$('tr[data-id="' + sapOrder.id + '"] > .no-scroll').text(sapOrder.get('comment'));
      }
    }

  });
});
