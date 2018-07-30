// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/data/clipboard',
  'app/planning/util/shift',
  'app/planning/util/contextMenu',
  'app/planning/PlanSapOrder',
  'app/core/templates/userInfo',
  'app/wh/templates/whList',
  'app/planning/templates/lineOrderComments',
  'app/planning/templates/orderStatusIcons'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  clipboard,
  shiftUtil,
  contextMenu,
  PlanSapOrder,
  userInfoTemplate,
  whListTemplate,
  lineOrderCommentsTemplate,
  orderStatusIconsTemplate
) {
  'use strict';

  return View.extend({

    template: whListTemplate,

    events: {
      'contextmenu tbody > tr[data-id]': function(e)
      {
        this.showMenu(e);

        return false;
      },
      'mousedown .planning-mrp-lineOrders-comment': function(e)
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
                text: PlanSapOrder.formatCommentWithIcon(comment)
              };
            })
          }),
          template: '<div class="popover planning-mrp-comment-popover">'
            + '<div class="arrow"></div>'
            + '<div class="popover-content"></div>'
            + '</div>'
        }).popover('show');
      },
      'mouseup .planning-mrp-lineOrders-comment': function(e)
      {
        this.$(e.currentTarget).popover('destroy');
      }
    },

    initialize: function()
    {
      var view = this;
      var plan = view.plan;
      var sapOrders = plan.sapOrders;

      view.listenTo(plan, 'change:loading change:updatedAt', view.scheduleRender);

      view.listenTo(sapOrders, 'reset', view.onOrdersReset);
      view.listenTo(sapOrders, 'change:comments', view.onCommentChange);
      view.listenTo(sapOrders, 'change:psStatus', view.onPsStatusChanged);

      view.listenTo(view.whOrders, 'reset', view.onOrdersReset);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        orders: this.serializeOrders()
      };
    },

    beforeRender: function()
    {
      clearTimeout(this.timers.render);
    },

    scheduleRender: function()
    {
      clearTimeout(this.timers.render);

      if (!this.plan.isAnythingLoading() && this.isRendered())
      {
        this.timers.render = setTimeout(this.renderIfNotLoading.bind(this), 1);
      }
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
      var view = this;
      var plan = view.plan;
      var prev = null;

      return view.whOrders.map(function(whOrder, i)
      {
        var orderNo = whOrder.get('order');
        var planOrder = plan.orders.get(orderNo);
        var sapOrder = plan.sapOrders.get(orderNo);
        var startTime = Date.parse(whOrder.get('startTime'));
        var finishTime = Date.parse(whOrder.get('finishTime'));
        var duration = finishTime - startTime;
        var qtyPlan = whOrder.get('qty');
        var item = {
          key: whOrder.id,
          no: i + 1,
          set: '',
          shift: shiftUtil.getShiftNo(startTime),
          orderNo: orderNo,
          mrp: planOrder.get('mrp'),
          nc12: planOrder.get('nc12'),
          name: planOrder.get('name'),
          startTime: time.utc.format(startTime, 'HH:mm:ss'),
          finishTime: time.utc.format(finishTime, 'HH:mm:ss'),
          group: whOrder.get('group'),
          duration: duration,
          pceTime: Math.ceil(duration / qtyPlan),
          qtyTodo: planOrder.get('quantityTodo'),
          qtyPlan: qtyPlan,
          line: whOrder.get('line'),
          comment: sapOrder ? sapOrder.getCommentWithIcon() : '',
          comments: sapOrder ? sapOrder.get('comments') : [],
          status: planOrder.getStatus(),
          statuses: view.serializeOrderStatuses(planOrder),
          rowClassName: sapOrder ? (sapOrder.get('whStatus') === 'done' ? 'success' : '') : '',
          newGroup: false,
          newLine: false
        };

        if (prev)
        {
          item.newGroup = item.group !== prev.group;
          item.newLine = item.line !== prev.line;
        }

        prev = item;

        return item;
      });
    },

    serializeOrderStatuses: function(planOrder)
    {
      return orderStatusIconsTemplate(this.plan, planOrder.id);
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showMenu: function(e)
    {
      var el = e.currentTarget;
      var orderNo = el.dataset.id;
      var menu = [
        contextMenu.actions.sapOrder(orderNo)
      ];

      if (this.plan.shiftOrders.findOrders(orderNo).length
        || this.plan.getActualOrderData(orderNo).quantityDone)
      {
        menu.push({
          icon: 'fa-file-text-o',
          label: t('planning', 'orders:menu:shiftOrder'),
          handler: this.handleShiftOrderAction.bind(this, orderNo)
        });
      }

      if (this.plan.canCommentOrders())
      {
        menu.push(contextMenu.actions.comment(orderNo));
      }

      menu.push({
        icon: 'fa-clipboard',
        label: t('planning', 'lineOrders:menu:copy'),
        handler: this.handleCopyAction.bind(this, el, e.pageY, e.pageX, false, false)
      });

      menu.push({
        label: t('planning', 'wh:menu:copy:lineGroup', {
          group: el.dataset.group,
          line: el.dataset.line
        }),
        handler: this.handleCopyAction.bind(this, el, e.pageY, e.pageX, true, false)
      });

      menu.push({
        label: t('planning', 'wh:menu:copy:lineGroupNo', {
          group: el.dataset.group,
          line: el.dataset.line
        }),
        handler: this.handleCopyAction.bind(this, el, e.pageY, e.pageX, true, true)
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

    handleCopyAction: function(el, y, x, lineGroupOnly, orderNoOnly)
    {
      var view = this;

      clipboard.copy(function(clipboardData)
      {
        if (!clipboardData)
        {
          return;
        }

        var columns = [
          'group',
          'no',
          'set',
          'shift',
          'mrp',
          'orderNo',
          'nc12',
          'name',
          'qtyPlan',
          'qtyTodo',
          'startTime',
          'finishTime',
          'line',
          'comment'
        ];
        var text = orderNoOnly
          ? []
          : [columns.map(function(p) { return t('planning', 'lineOrders:list:' + p); }).join('\t')];
        var line = el.dataset.line;
        var group = +el.dataset.group;

        view.serializeOrders().forEach(function(order)
        {
          if (lineGroupOnly && (order.line !== line || order.group !== group))
          {
            return;
          }

          if (orderNoOnly)
          {
            text.push(order.orderNo);

            return;
          }

          var row = [
            order.group,
            order.no,
            order.set,
            order.shift,
            order.mrp,
            order.orderNo,
            order.nc12,
            order.name,
            order.qtyPlan,
            order.qtyTodo,
            order.startTime,
            order.finishTime,
            order.line,
            '"' + order.comments
              .map(function(comment) { return comment.user.label + ': ' + comment.text.replace(/"/g, "'"); })
              .join('\r\n--\r\n') + '"'
          ];

          text.push(row.join('\t'));
        });

        if (orderNoOnly)
        {
          text = _.uniq(text);
        }

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

    onCommentChange: function(sapOrder)
    {
      if (this.plan.orders.get(sapOrder.id))
      {
        this.$('tr[data-id="' + sapOrder.id + '"] > .planning-mrp-lineOrders-comment').html(
          sapOrder.getCommentWithIcon()
        );
      }
    },

    onOrdersReset: function(orders, options)
    {
      if (!options.reload)
      {
        this.scheduleRender();
      }
    },

    onPsStatusChanged: function(sapOrder)
    {
      var $order = this.$('tr[data-id="' + sapOrder.id + '"]');

      if ($order.length)
      {
        var psStatus = this.plan.sapOrders.getPsStatus(sapOrder.id);

        $order
          .find('.planning-mrp-list-property-psStatus')
          .attr('title', t('planning', 'orders:psStatus:' + psStatus))
          .attr('data-ps-status', psStatus);
      }
    }

  });
});
