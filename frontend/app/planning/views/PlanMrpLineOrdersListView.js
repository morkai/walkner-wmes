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
        if (this.options.mode === 'wh')
        {
          return;
        }

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
      }
    },

    initialize: function()
    {
      var view = this;

      view.expanded = this.options.mode === 'wh';

      view.listenTo(view.mrp.lines, 'reset added changed removed', view.renderIfNotLoading);

      view.listenTo(view.mrp.orders, 'highlight', view.onOrderHighlight);

      view.listenTo(view.plan.sapOrders, 'change:comments', view.onCommentChange);
      view.listenTo(view.plan.sapOrders, 'reset', view.onSapOrdersReset);
      view.listenTo(view.plan.sapOrders, 'change:psStatus', view.onPsStatusChanged);
      view.listenTo(view.plan.sapOrders, 'change:whStatus', view.onWhStatusChanged);
      view.listenTo(view.plan.sapOrders, 'change:whDropZone change:whTime', view.onWhDropZoneChanged);
    },

    getTemplateData: function()
    {
      var whMode = this.options.mode === 'wh';

      return {
        expanded: this.expanded,
        orders: this.serializeOrders(),
        hiddenColumns: {
          finishTime: whMode,
          lines: whMode
        }
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
      var view = this;
      var sapOrders = view.plan.sapOrders;
      var mrp = view.mrp;
      var map = {};
      var whMode = view.options.mode === 'wh';

      mrp.lines.forEach(function(line)
      {
        line.orders.forEach(function(lineOrder)
        {
          var orderNo = lineOrder.get('orderNo');
          var planOrder = view.plan.orders.get(orderNo);
          var sapOrder = sapOrders.get(orderNo);
          var item = map[orderNo];

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
              statuses: view.serializeOrderStatuses(orderNo),
              dropZone: sapOrder ? sapOrder.getDropZone() : '',
              rowClassName: whMode && sapOrder
                ? (sapOrder.get('whStatus') === 'done' ? 'success' : '')
                : ''
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

      if (this.plan.canChangeDropZone())
      {
        menu.push({
          icon: 'fa-level-down',
          label: this.t('orders:menu:dropZone'),
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
          'dropZone',
          'lines',
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
            order.dropZone,
            order.lines,
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

    handleDropZoneAction: function(orderNo)
    {
      var dialogView = new PlanOrderDropZoneDialogView({
        plan: this.plan,
        mrp: this.mrp,
        order: this.plan.orders.get(orderNo)
      });

      viewport.showDialog(dialogView, this.t('orders:menu:dropZone:title'));
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
          .attr('title', this.t('orders:whStatus:' + whStatus))
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
