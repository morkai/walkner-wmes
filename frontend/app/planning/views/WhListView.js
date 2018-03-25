// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/data/clipboard',
  '../util/shift',
  '../util/contextMenu',
  '../PlanSapOrder',
  './PlanOrderDropZoneDialogView',
  'app/core/templates/userInfo',
  'app/planning/templates/whList',
  'app/planning/templates/lineOrderComments',
  'app/planning/templates/orderStatusIcons'
], function(
  _,
  $,
  t,
  time,
  viewport,
  View,
  clipboard,
  shiftUtil,
  contextMenu,
  PlanSapOrder,
  PlanOrderDropZoneDialogView,
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
      },
      'click .planning-mrp-lineOrders-dropZone': function(e)
      {
        this.handleDropZoneAction(this.$(e.target).closest('tr').attr('data-id'));
      }
    },

    initialize: function()
    {
      var view = this;
      var plan = view.plan;
      var sapOrders = plan.sapOrders;

      view.listenTo(plan, 'change:loading change:updatedAt', view.scheduleRender);

      view.listenTo(sapOrders, 'change:comments', view.onCommentChange);
      view.listenTo(sapOrders, 'reset', view.onSapOrdersReset);
      view.listenTo(sapOrders, 'change:psStatus', view.onPsStatusChanged);
      view.listenTo(sapOrders, 'change:whStatus', view.onWhStatusChanged);
      view.listenTo(sapOrders, 'change:whDropZone change:whTime', view.onWhDropZoneChanged);
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

      if (!this.plan.isAnythingLoading())
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
      var list = [];

      view.groupDuration = plan.settings.global.getWhGroupDuration();
      view.groupTimeWindow = view.groupDuration * 3600 * 1000;

      plan.lines.forEach(function(planLine)
      {
        for (var i = 0; i < planLine.orders.length; ++i)
        {
          var lineOrder = planLine.orders.models[i];
          var orderNo = lineOrder.get('orderNo');
          var order = plan.orders.get(orderNo);

          if (!order)
          {
            continue;
          }

          var mrp = order.get('mrp');

          if (!plan.mrps.get(mrp))
          {
            continue;
          }

          var sapOrder = plan.sapOrders.get(orderNo);
          var startTime = Date.parse(lineOrder.get('startAt'));
          var finishTime = Date.parse(lineOrder.get('finishAt'));
          var duration = finishTime - startTime;
          var qtyPlan = lineOrder.get('quantity');
          var pceTime = Math.ceil(duration / qtyPlan);
          var item = {
            orderNo: orderNo,
            mrp: mrp,
            nc12: order.get('nc12'),
            name: order.get('name'),
            startTime: startTime,
            finishTime: finishTime,
            group: view.getOrderGroup(startTime),
            duration: duration,
            pceTime: pceTime,
            maxQty: Math.floor(view.groupTimeWindow / pceTime),
            qtyTodo: order.get('quantityTodo'),
            qtyPlan: qtyPlan,
            line: planLine.id,
            comment: sapOrder ? sapOrder.getCommentWithIcon() : '',
            comments: sapOrder ? sapOrder.get('comments') : [],
            status: order.getStatus(),
            statuses: view.serializeOrderStatuses(order),
            dropZone: sapOrder ? sapOrder.getDropZone() : '',
            rowClassName: sapOrder ? (sapOrder.get('whStatus') === 'done' ? 'success' : '') : '',
            newGroup: false,
            newLine: false
          };

          if (item.finishTime - item.startTime > view.groupTimeWindow)
          {
            view.splitOrder(item, list);
          }
          else
          {
            list.push(item);
          }
        }
      });

      var sortByLines = plan.settings.global.getValue('wh.sortByLines', false);

      list.sort(function(a, b)
      {
        if (a.group !== b.group)
        {
          return a.group - b.group;
        }

        if (sortByLines && a.line !== b.line)
        {
          return a.line.localeCompare(b.line);
        }

        return a.startTime - b.startTime;
      });

      var prev = null;

      return list.map(function(order, i)
      {
        order.no = i + 1;
        order.shift = shiftUtil.getShiftNo(order.startTime);
        order.startTime = time.utc.format(order.startTime, 'HH:mm:ss');
        order.finishTime = time.utc.format(order.finishTime, 'HH:mm:ss');

        if (prev)
        {
          order.newGroup = order.group !== prev.group;
          order.newLine = sortByLines && order.line !== prev.line;
        }

        prev = order;

        return order;
      });
    },

    getOrderGroup: function(startTime)
    {
      var startHour = new Date(startTime).getUTCHours();

      if (startHour < 6)
      {
        startHour = 18 + startHour;
      }
      else
      {
        startHour -= 6;
      }

      return Math.floor(startHour / this.groupDuration) + 1;
    },

    splitOrder: function(bigItem, list)
    {
      var partCount = Math.ceil(bigItem.duration / this.groupTimeWindow);
      var qtyPlan = bigItem.qtyPlan;
      var startTime = bigItem.startTime;

      for (var i = 0; i < partCount; ++i)
      {
        var item = _.assign({}, bigItem, {
          startTime: startTime,
          finishTime: 0,
          group: this.getOrderGroup(startTime),
          qtyPlan: Math.min(qtyPlan, bigItem.maxQty)
        });

        list.push(item);

        qtyPlan -= bigItem.maxQty;
        startTime = item.finishTime = startTime + bigItem.pceTime * item.qtyPlan;
      }
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
        handler: this.handleCopyAction.bind(this, el, e.pageY, e.pageX)
      });

      menu.push({
        label: t('planning', 'wh:menu:copy:lineGroup', {
          group: el.dataset.group,
          line: el.dataset.line
        }),
        handler: this.handleCopyAction.bind(this, el, e.pageY, e.pageX, true)
      });

      menu.push({
        label: t('planning', 'wh:menu:copy:lineGroupNo', {
          group: el.dataset.group,
          line: el.dataset.line
        }),
        handler: this.handleCopyAction.bind(this, el, e.pageY, e.pageX, true, true)
      });

      if (this.plan.canChangeDropZone())
      {
        menu.push({
          icon: 'fa-level-down',
          label: t('planning', 'orders:menu:dropZone'),
          handler: this.handleDropZoneAction.bind(this, orderNo)
        });
      }


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
          'shift',
          'mrp',
          'orderNo',
          'nc12',
          'name',
          'qtyPlan',
          'qtyTodo',
          'startTime',
          'finishTime',
          'dropZone',
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
            order.shift,
            order.mrp,
            order.orderNo,
            order.nc12,
            order.name,
            order.qtyPlan,
            order.qtyTodo,
            order.startTime,
            order.finishTime,
            order.dropZone,
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

    handleDropZoneAction: function(orderNo)
    {
      var dialogView = new PlanOrderDropZoneDialogView({
        plan: this.plan,
        order: this.plan.orders.get(orderNo)
      });

      viewport.showDialog(dialogView, t('planning', 'orders:menu:dropZone:title'));
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

    onSapOrdersReset: function(sapOrders, options)
    {
      if (!options.reload && this.plan.displayOptions.isLatestOrderDataUsed() && !this.plan.isAnythingLoading())
      {
        this.render();
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
    },

    onWhStatusChanged: function(sapOrder)
    {
      var $order = this.$('tr[data-id="' + sapOrder.id + '"]');

      if ($order.length)
      {
        var whStatus = this.plan.sapOrders.getWhStatus(sapOrder.id);

        $order
          .toggleClass('success', this.options.mode === 'wh' && whStatus === 'done')
          .find('.planning-mrp-list-property-whStatus')
          .attr('title', t('planning', 'orders:whStatus:' + whStatus))
          .attr('data-wh-status', whStatus);
      }
    },

    onWhDropZoneChanged: function(sapOrder)
    {
      var $order = this.$('tr[data-id="' + sapOrder.id + '"]');

      if ($order.length)
      {
        $order.find('.planning-mrp-lineOrders-dropZone').html(sapOrder.getDropZone());
      }
    }

  });
});
