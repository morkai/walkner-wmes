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
  'app/planning/util/contextMenu',
  'app/planning/PlanSapOrder',
  'app/core/templates/userInfo',
  'app/wh/templates/whList',
  'app/wh/templates/whListRow',
  'app/wh/templates/whListPopover',
  'app/planning/templates/lineOrderComments'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  clipboard,
  contextMenu,
  PlanSapOrder,
  userInfoTemplate,
  whListTemplate,
  whListRowTemplate,
  whListPopoverTemplate,
  lineOrderCommentsTemplate
) {
  'use strict';

  return View.extend({

    template: whListTemplate,

    events: {
      'contextmenu td[data-column-id]': function(e)
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

        var sapOrder = this.plan.sapOrders.get(e.currentTarget.parentNode.dataset.order);

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
      'click .is-clickable[data-column-id="set"]': function(e)
      {
        this.trigger('setClicked', e.currentTarget.parentNode.dataset.id);
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
      view.listenTo(view.whOrders, 'change', view.onOrderChanged);

      $(window).on('scroll.' + view.idPrefix, view.positionStickyHeaders.bind(view));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      if (this.$stickyHeaders)
      {
        this.$stickyHeaders.remove();
        this.$stickyHeaders = null;
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        renderRow: whListRowTemplate,
        rows: this.serializeRows()
      };
    },

    serializeRows: function()
    {
      return this.whOrders.serialize(this.plan);
    },

    beforeRender: function()
    {
      clearTimeout(this.timers.render);
    },

    afterRender: function()
    {
      this.setUpStickyHeaders();
      this.setUpPopover();
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

    setUpPopover: function()
    {
      var view = this;

      view.$el.popover({
        selector: '.wh-has-popover',
        container: 'body',
        placement: 'top auto',
        trigger: 'hover',
        html: true,
        title: function()
        {
          return t('wh', 'list:popover:' + this.dataset.columnId);
        },
        content: function()
        {
          var whOrder = view.whOrders.get($(this).closest('.wh-list-item')[0].dataset.id);
          var templateData = {
            user: null,
            status: null,
            carts: [],
            problemArea: '',
            comment: ''
          };

          if (this.dataset.columnId === 'picklist')
          {
            var picklistFunc = whOrder.getFunc(whOrder.get('picklistFunc'));

            if (picklistFunc)
            {
              templateData.user = picklistFunc.user.label;
              templateData.status = t('wh', 'status:picklistDone:' + whOrder.get('picklistDone'));
            }
            else
            {
              templateData.status = t('wh', 'status:pending');
            }
          }
          else
          {
            var func = whOrder.getFunc(this.dataset.columnId);

            templateData.status = t('wh', 'status:' + func.status);
            templateData.carts = func.carts;
            templateData.problemArea = func.problemArea;
            templateData.comment = func.comment;

            if (func.user)
            {
              templateData.user = func.user.label;
            }
          }

          return view.renderPartial(whListPopoverTemplate, templateData);
        },
        template: function(defaultTemplate)
        {
          return $(defaultTemplate).addClass('wh-list-popover');
        }
      });
    },

    setUpStickyHeaders: function()
    {
      this.$stickyHeaders = $('<div class="planning-wh-list wh-list-sticky"></div>').html(
        '<table class="planning-mrp-lineOrders-table">'
        + this.$('thead').first()[0].outerHTML
        + '</table>'
      );

      this.adjustStickyHeaders();
      this.positionStickyHeaders();

      var $body = $(document.body);

      $body.find('.wh-list-sticky').remove();
      $body.append(this.$stickyHeaders);
    },

    adjustStickyHeaders: function()
    {
      if (!this.$stickyHeaders)
      {
        return;
      }

      var $stickyThs = this.$stickyHeaders.find('th');

      this.$('th').each(function(i)
      {
        var rects = this.getClientRects();

        $stickyThs[i].style.width = (rects.length ? rects[0].width : 0) + 'px';
      });
    },

    positionStickyHeaders: function()
    {
      if (!this.$stickyHeaders)
      {
        return;
      }

      this.$stickyHeaders[0].classList.toggle('hidden', window.scrollY < this.el.offsetTop);
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showMenu: function(e)
    {
      var td = e.currentTarget;
      var tr = td.parentNode;
      var whOrder = this.whOrders.get(tr.dataset.id);
      var orderNo = whOrder.get('order');
      var set = whOrder.get('set');
      var status = whOrder.get('status');
      var menu = [
        contextMenu.actions.sapOrder(orderNo)
      ];

      if (user.isAllowedTo('PROD_DATA:VIEW')
        && (this.plan.shiftOrders.findOrders(orderNo).length
        || this.plan.getActualOrderData(orderNo).quantityDone))
      {
        menu.push({
          icon: 'fa-file-text-o',
          label: t('wh', 'menu:shiftOrder'),
          handler: this.handleShiftOrderAction.bind(this, orderNo)
        });
      }

      if (this.plan.canCommentOrders())
      {
        menu.push(contextMenu.actions.comment(orderNo));
      }

      menu.push('-');

      menu.push({
        icon: 'fa-clipboard',
        label: t('wh', 'menu:copy:all'),
        handler: this.handleCopyAction.bind(this, tr, e.pageY, e.pageX, false, false)
      });

      if (user.isAllowedTo('WH:MANAGE'))
      {
        menu.push('-');

        if (status === 'cancelled')
        {
          menu.push({
            icon: 'fa-recycle',
            label: t('wh', 'menu:restoreOrder'),
            handler: this.handleRestoreAction.bind(this, {orders: [whOrder.id]})
          });

          if (set)
          {
            menu.push({
              label: t('wh', 'menu:restoreSet'),
              handler: this.handleRestoreAction.bind(this, {set: set})
            });
          }
        }
        else
        {
          menu.push({
            icon: 'fa-times',
            label: t('wh', 'menu:cancelOrder'),
            handler: this.handleCancelAction.bind(this, {orders: [whOrder.id]})
          });

          if (set)
          {
            menu.push({
              label: t('wh', 'menu:cancelSet'),
              handler: this.handleCancelAction.bind(this, {set: set})
            });
          }
        }

        if (status !== 'pending')
        {
          menu.push({
            icon: 'fa-eraser',
            label: t('wh', 'menu:resetOrder'),
            handler: this.handleResetAction.bind(this, {orders: [whOrder.id]})
          });

          if (set)
          {
            menu.push({
              label: t('wh', 'menu:resetSet'),
              handler: this.handleResetAction.bind(this, {set: set})
            });
          }
        }
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

    handleCopyAction: function(tr, y, x, lineGroupOnly, orderNoOnly)
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
          'order',
          'nc12',
          'name',
          'qtyPlan',
          'qtyTodo',
          'startTime',
          'finishTime',
          'line',
          'picklist',
          'fmx',
          'kitter',
          'packer',
          'comment'
        ];
        var text = orderNoOnly
          ? []
          : [columns.map(function(p) { return t('wh', 'prop:' + p); }).join('\t')];
        var whOrder = view.whOrders.get(tr.dataset.id);
        var line = whOrder.get('line');
        var group = whOrder.get('group');

        view.serializeRows().forEach(function(order)
        {
          if (lineGroupOnly && (order.line !== line || order.group !== group))
          {
            return;
          }

          if (orderNoOnly)
          {
            text.push(order.order);

            return;
          }

          var row = [
            order.group,
            order.no,
            order.set,
            order.shift,
            order.mrp,
            order.order,
            order.nc12,
            order.name,
            order.qty,
            order.qtyTodo,
            order.startTime,
            order.finishTime,
            order.line,
            order.picklistFunc ? (order.picklistDone ? 1 : 0) : '',
            t('wh', 'status:' + order.funcs[0].status),
            t('wh', 'status:' + order.funcs[1].status),
            t('wh', 'status:' + order.funcs[2].status),
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

        var $btn = view.$(tr).tooltip({
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

    handleResetAction: function(filter)
    {
      this.promised(this.whOrders.act('resetOrders', filter));
    },

    handleCancelAction: function(filter)
    {
      this.promised(this.whOrders.act('cancelOrders', filter));
    },

    handleRestoreAction: function(filter)
    {
      this.promised(this.whOrders.act('restoreOrders', filter));
    },

    onCommentChange: function(sapOrder)
    {
      if (this.plan.orders.get(sapOrder.id))
      {
        this.$('tr[data-order="' + sapOrder.id + '"] > .planning-mrp-lineOrders-comment').html(
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
      var $order = this.$('tr[data-order="' + sapOrder.id + '"]');

      if ($order.length)
      {
        var psStatus = this.plan.sapOrders.getPsStatus(sapOrder.id);

        $order
          .find('.planning-mrp-list-property-psStatus')
          .attr('title', t('planning', 'orders:psStatus:' + psStatus))
          .attr('data-ps-status', psStatus);
      }
    },

    onOrderChanged: function(whOrder)
    {
      var $tr = this.$('tr[data-id="' + whOrder.id + '"]');

      if (!$tr.length)
      {
        return;
      }

      var i = this.whOrders.indexOf(whOrder);

      $tr.replaceWith(whListRowTemplate({
        row: whOrder.serialize(this.plan, i)
      }));

      this.adjustStickyHeaders();
    }

  });
});
