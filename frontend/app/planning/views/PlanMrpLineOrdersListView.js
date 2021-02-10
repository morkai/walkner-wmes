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
  'app/planning/templates/lineOrdersList',
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
  lineOrdersListTemplate,
  lineOrderCommentsTemplate,
  orderStatusIconsTemplate
) {
  'use strict';

  return View.extend({

    template: lineOrdersListTemplate,

    modelProperty: 'plan',

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
      },
      'click th[data-id="startTime"]': function()
      {
        this.reorder('startTime');
      },
      'click th[data-id="lines"]': function()
      {
        this.reorder('lines');
      }
    },

    initialize: function()
    {
      this.expanded = false;

      this.listenTo(this.mrp.lines, 'reset added changed removed', this.renderIfNotLoading);

      this.listenTo(this.mrp.orders, 'highlight', this.onOrderHighlight);

      this.listenTo(this.plan.sapOrders, 'change:comments', this.onCommentChange);
      this.listenTo(this.plan.sapOrders, 'reset', this.onSapOrdersReset);
      this.listenTo(this.plan.sapOrders, 'change:psStatus', this.onPsStatusChanged);
    },

    getTemplateData: function()
    {
      return {
        version: this.plan.settings.getVersion(),
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
      const sapOrders = this.plan.sapOrders;
      const map = {};

      this.mrp.lines.forEach(line =>
      {
        line.orders.forEach(lineOrder =>
        {
          const orderNo = lineOrder.get('orderNo');
          const planOrder = this.plan.orders.get(orderNo);
          const sapOrder = sapOrders.get(orderNo);
          let item = map[orderNo];

          if (!item)
          {
            item = map[orderNo] = {
              orderNo: orderNo,
              nc12: planOrder ? planOrder.get('nc12') : '',
              name: planOrder ? planOrder.get('name') : '',
              startTime: Number.MAX_VALUE,
              finishTime: 0,
              qtyTodo: planOrder ? planOrder.get('quantityTodo') : -1,
              qtyPlan: 0,
              lines: {},
              comment: sapOrder ? sapOrder.getCommentWithIcon() : '',
              comments: sapOrder ? sapOrder.get('comments') : [],
              status: planOrder ? planOrder.getStatus() : 'missing',
              statuses: this.serializeOrderStatuses(orderNo),
              orderGroup: '',
              rowClassName: ''
            };
          }

          if (!item.orderGroup)
          {
            const orderGroupId = lineOrder.get('group');

            if (orderGroupId)
            {
              const orderGroup = this.orderGroups.get(orderGroupId);

              item.orderGroup = orderGroup ? orderGroup.getLabel() : orderGroupId;
            }
          }

          item.qtyPlan += lineOrder.get('quantity');

          const startTime = Date.parse(lineOrder.get('startAt'));

          if (startTime < item.startTime)
          {
            item.startTime = startTime;
          }

          const finishTime = Date.parse(lineOrder.get('finishAt'));

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

      const orders = _.values(map);

      orders.forEach(order =>
      {
        order.shift = shiftUtil.getShiftNo(order.startTime);
        order.lineSort = Object.keys(order.lines).join(' ');
        order.lines = _.map(order.lines, (qty, line) => `${line} (${qty})`).join('; ');
      });

      const orderByTime = this.plan.displayOptions.get('lineOrdersSort') === 'startTime';

      orders.sort((a, b) =>
      {
        if (orderByTime)
        {
          return a.startTime - b.startTime;
        }

        let cmp = a.lineSort.localeCompare(b.lineSort, undefined, {numeric: true});

        if (cmp === 0)
        {
          cmp = a.startTime - b.startTime;
        }

        return cmp;
      });

      orders.forEach((order, i) =>
      {
        order.startTime = time.utc.format(order.startTime, 'HH:mm:ss');
        order.finishTime = time.utc.format(order.finishTime, 'HH:mm:ss');
        order.no = i + 1;
      });

      return orders;
    },

    serializeOrderStatuses: function(orderNo)
    {
      return orderStatusIconsTemplate(this.plan, orderNo);
    },

    formatIcon: function(icon, title)
    {
      return '<span class="planning-mrp-list-property" title="' + _.escape(this.t(title)) + '">'
        + '<i class="fa ' + icon + '"></i>'
        + '</span>';
    },

    reorder: function(orderBy)
    {
      this.plan.displayOptions.set('lineOrdersSort', orderBy);
      this.render();
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
          icon: 'fa-file-text-o',
          label: this.t('orders:menu:shiftOrder'),
          handler: this.handleShiftOrderAction.bind(this, orderNo)
        });
      }

      if (this.plan.canCommentOrders())
      {
        menu.push(contextMenu.actions.commentPopover(orderNo));
      }

      menu.push({
        icon: 'fa-clipboard',
        label: this.t('lineOrders:menu:copy'),
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

      window.open('/#prodShiftOrders?sort(startedAt)&limit(-1337)&orderId=string:' + orderNo);
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

        var columns = [
          'no',
          'shift',
          'orderNo',
          'nc12',
          'name',
          'qtyPlan',
          'qtyTodo',
          'startTime',
          'finishTime',
          'lines',
          'orderGroup',
          'comment'
        ];
        var text = [columns.map(function(p) { return view.t('lineOrders:list:' + p); }).join('\t')];

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
            order.lines,
            order.orderGroup,
            '"' + order.comments
              .map(function(comment) { return comment.user.label + ': ' + comment.text.replace(/"/g, "'"); })
              .join('\r\n--\r\n') + '"'
          ];

          text.push(row.join('\t'));
        });

        clipboardData.setData('text/plain', text.join('\r\n'));
        clipboard.showTooltip({x: x, y: y, text: view.t('lineOrders:menu:copy:success')});
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
          .attr('title', this.t('orders:psStatus:' + psStatus))
          .attr('data-ps-status', psStatus);
      }
    }

  });
});
