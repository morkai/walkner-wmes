// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/data/clipboard',
  'app/planning/util/contextMenu',
  'app/planning/PlanSapOrder',
  'app/planning/templates/lineOrderComments',
  'app/orders/util/commentPopover',
  'app/wh-lines/WhLine',
  'app/wh/templates/pickup/list',
  'app/wh/templates/pickup/row',
  'app/wh/templates/pickup/popover',
  'app/wh/templates/pickup/linePopover'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  userInfoTemplate,
  clipboard,
  contextMenu,
  PlanSapOrder,
  lineOrderCommentsTemplate,
  commentPopover,
  WhLine,
  listTemplate,
  rowTemplate,
  popoverTemplate,
  linePopoverTemplate
) {
  'use strict';

  return View.extend({

    template: listTemplate,

    modelProperty: 'whOrders',

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
          className: 'planning-mrp-comment-popover',
          content: lineOrderCommentsTemplate({
            comments: comments.map(function(comment)
            {
              return {
                user: userInfoTemplate({noIp: true, userInfo: comment.user}),
                time: time.toTagData(comment.time).human,
                text: PlanSapOrder.formatCommentWithIcon(comment)
              };
            })
          })
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

      view.listenTo(view.whLines, 'change', view.onLineChanged);
      view.listenTo(view.whLines, 'change:redirLine', view.onRedirLineChanged);

      view.listenTo(plan.displayOptions, 'change:whStatuses', view.onWhStatusesFilterChanged);
      view.listenTo(plan.displayOptions, 'change:psStatuses', view.onPsStatusesFilterChanged);
      view.listenTo(plan.displayOptions, 'change:from change:to', view.onStartTimeFilterChanged);

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

      $('.popover').popover('destroy');
    },

    getTemplateData: function()
    {
      return {
        renderRow: rowTemplate,
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

      $('.popover').popover('destroy');
    },

    afterRender: function()
    {
      this.setUpStickyHeaders();
      this.setUpPopover();
      this.toggleSeparatorRowVisibility();
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
        className: 'wh-list-popover',
        hasContent: function()
        {
          var columnId = this.dataset.columnId;
          var orderId = $(this).closest('.wh-list-item')[0].dataset.id;
          var hasTitle = view.t.has('list:popover:' + columnId);
          var hasOrder = !!view.whOrders.get(orderId);

          return hasTitle && hasOrder;
        },
        title: function()
        {
          return view.t('list:popover:' + this.dataset.columnId);
        },
        content: function()
        {
          var whOrder = view.whOrders.get($(this).closest('.wh-list-item')[0].dataset.id);

          if (!whOrder)
          {
            return '';
          }

          var columnId = this.dataset.columnId;

          if (columnId === 'line')
          {
            var lines = whOrder.get('lines');
            var redirLines = whOrder.get('redirLines');

            return view.renderPartial(linePopoverTemplate, {
              orderId: whOrder.id,
              lines: lines.map(function(whOrderLine, i)
              {
                var whLine = view.whLines.get(whOrderLine._id) || new WhLine({_id: whOrderLine._id});
                var redirLine = view.whLines.get(redirLines && redirLines[i] || null);
                var line = whLine.toJSON();

                if (redirLine)
                {
                  line._id = redirLine.id;
                  line.redirLine = whLine.id;
                }

                return line;
              })
            });
          }

          var templateData = {
            user: null,
            status: null,
            carts: [],
            problemArea: '',
            comment: '',
            qtyPerLine: []
          };

          if (columnId === 'qty')
          {
            templateData.qtyPerLine = whOrder.get('lines').map(function(line)
            {
              return {
                line: line._id,
                qty: line.qty,
                max: whOrder.get('qty')
              };
            });
          }
          else if (columnId === 'fifoStatus' || columnId === 'packStatus')
          {
            templateData.status = view.t('status:' + whOrder.get(columnId));
          }
          else if (columnId === 'picklist')
          {
            var picklistFunc = whOrder.getFunc(whOrder.get('picklistFunc'));
            var picklistDone = whOrder.get('picklistDone');

            if (picklistDone !== 'pending')
            {
              templateData.user = picklistFunc ? picklistFunc.user.label : null;
              templateData.status = view.t('status:picklistDone:' + picklistDone);
            }
            else
            {
              templateData.status = view.t('status:pending');
            }
          }
          else if (columnId === 'fmx'
            || columnId === 'kitter'
            || columnId === 'platformer'
            || columnId === 'packer')
          {
            var func = whOrder.getFunc(this.dataset.columnId);

            templateData.status = view.t('status:' + func.status);
            templateData.carts = func.carts;
            templateData.problemArea = func.problemArea;
            templateData.comment = func.comment;

            if (func.user)
            {
              templateData.user = func.user.label;
            }
          }

          return view.renderPartial(popoverTemplate, templateData);
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
      var view = this;
      var td = e.currentTarget;
      var tr = td.parentNode;
      var whOrder = view.whOrders.get(tr.dataset.id);

      if (!whOrder)
      {
        return;
      }

      var orderNo = whOrder.get('order');
      var set = whOrder.get('set');
      var pickStatus = whOrder.get('status');
      var menu = [
        contextMenu.actions.sapOrder(orderNo)
      ];

      if (user.isAllowedTo('PROD_DATA:VIEW')
        && (view.plan.shiftOrders.findOrders(orderNo).length
        || view.plan.getActualOrderData(orderNo).quantityDone))
      {
        menu.push({
          icon: 'fa-file-text-o',
          label: view.t('menu:shiftOrder'),
          handler: view.handleShiftOrderAction.bind(view, orderNo)
        });
      }

      if (view.plan.canCommentOrders())
      {
        menu.push(contextMenu.actions.commentPopover(orderNo, 'wh'));
      }

      menu.push('-');

      menu.push({
        icon: 'fa-clipboard',
        label: view.t('menu:copy:all'),
        handler: view.handleCopyAction.bind(view, tr, e.pageY, e.pageX, false, false)
      });

      if ((user.isAllowedTo('WH:MANAGE') && !view.whOrders.isSetDelivered(set))
        || (window.ENV === 'development' && user.isAllowedTo('SUPER')))
      {
        menu.push('-');

        if (pickStatus !== 'cancelled')
        {
          menu.push({
            icon: 'fa-times',
            label: view.t('menu:cancelOrder'),
            handler: view.handleCancelAction.bind(view, {orders: [whOrder.id]})
          });

          if (set)
          {
            menu.push({
              label: view.t('menu:cancelSet'),
              handler: view.handleCancelAction.bind(view, {set: set})
            });
          }
        }

        if (pickStatus !== 'pending')
        {
          menu.push({
            icon: 'fa-eraser',
            label: view.t('menu:resetOrder'),
            handler: view.handleResetAction.bind(view, {orders: [whOrder.id]})
          });

          if (set)
          {
            menu.push({
              label: view.t('menu:resetSet'),
              handler: view.handleResetAction.bind(view, {set: set})
            });
          }
        }
      }

      contextMenu.show(view, e.pageY, e.pageX, menu);
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
          'platformer',
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
          if (order.hidden)
          {
            return;
          }

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
            view.t('status:' + order.picklistDone)
          ];

          order.funcs.forEach(function(func)
          {
            row.push(view.t('status:' + func.status));
          });

          row.push(
            '"' + order.comments
              .map(function(comment) { return comment.user.label + ': ' + comment.text.replace(/"/g, "'"); })
              .join('\r\n--\r\n') + '"'
          );

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
          title: view.t('planning', 'lineOrders:menu:copy:success')
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
      viewport.msg.saving();

      this.promised(this.whOrders.act('resetOrders', filter))
        .done(function() { viewport.msg.saved(); })
        .fail(function() { viewport.msg.savingFailed(); });
    },

    handleCancelAction: function(filter)
    {
      viewport.msg.saving();

      this.promised(this.whOrders.act('resetOrders', Object.assign({cancel: true}, filter)))
        .done(function() { viewport.msg.saved(); })
        .fail(function() { viewport.msg.savingFailed(); });
    },

    handleRestoreAction: function(filter)
    {
      viewport.msg.saving();

      this.promised(this.whOrders.act('restoreOrders', filter))
        .done(function() { viewport.msg.saved(); })
        .fail(function() { viewport.msg.savingFailed(); });
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
      if (this.whOrders.length === 0)
      {
        this.render();
      }
      else if (!options.reload)
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

      $tr.replaceWith(rowTemplate({
        row: whOrder.serialize(this.plan, i, this.whOrders.getFilters(this.plan))
      }));

      this.adjustStickyHeaders();
      this.toggleSeparatorRowVisibility();
    },

    onLineChanged: function(whLine)
    {
      var view = this;
      var redirLineChanged = whLine.hasChanged('redirLine');
      var changedWhLineId = whLine.id;

      $('.wh-list-popover-line').each(function()
      {
        var whOrder = view.whOrders.get(this.dataset.orderId);

        if (!whOrder)
        {
          return;
        }

        if (!redirLineChanged)
        {
          var anyMatchingLines = whOrder.get('lines').some(function(whOrderLine)
          {
            if (whOrderLine._id === changedWhLineId)
            {
              return true;
            }

            var whLine = view.whLines.get(whOrderLine._id);

            return whLine && whLine.get('redirLine') === changedWhLineId;
          });

          if (!anyMatchingLines)
          {
            return;
          }
        }

        var $tr = view.$('tr[data-id="' + whOrder.id + '"]');
        var $line = $tr.find('td[data-column-id="line"]');
        var popover = $line.data('bs.popover');

        if (popover)
        {
          popover.show({transition: false});
        }
      });
    },

    onRedirLineChanged: function(whLine)
    {
      var filters = this.whOrders.getFilters(this.plan);
      var changed = false;

      for (var i = 0; i < this.whOrders.length; ++i)
      {
        var whOrder = this.whOrders.models[i];

        if (!whOrder.get('lines').some(function(line) { return line._id === whLine.id; }))
        {
          continue;
        }

        var $tr = this.$('tr[data-id="' + whOrder.id + '"]');

        if (!$tr.length)
        {
          continue;
        }

        $tr.replaceWith(rowTemplate({
          row: whOrder.serialize(this.plan, i, filters)
        }));

        changed = true;
      }

      if (changed)
      {
        this.adjustStickyHeaders();
        this.toggleSeparatorRowVisibility();
      }
    },

    onWhStatusesFilterChanged: function()
    {
      this.toggleOrderRowVisibility();
    },

    onPsStatusesFilterChanged: function()
    {
      this.toggleOrderRowVisibility();
    },

    onStartTimeFilterChanged: function()
    {
      this.toggleOrderRowVisibility();
    },

    toggleOrderRowVisibility: function()
    {
      var view = this;
      var filters = view.whOrders.getFilters(view.plan);

      view.$('.wh-list-item').each(function()
      {
        var startTime = +this.dataset.startTime;
        var hidden = startTime < filters.startTime.from || startTime >= filters.startTime.to;

        if (!hidden && filters.whStatuses.length)
        {
          hidden = filters.whStatuses.indexOf(this.dataset.status) === -1;
        }

        if (!hidden && filters.psStatuses.length)
        {
          var psStatusEl = this.querySelector('.planning-mrp-list-property-psStatus');
          var psStatus = psStatusEl ? psStatusEl.dataset.psStatus : 'unknown';

          hidden = filters.psStatuses.indexOf(psStatus) === -1;
        }

        this.classList.toggle('hidden', hidden);
      });

      view.toggleSeparatorRowVisibility();
    },

    toggleSeparatorRowVisibility: function()
    {
      var $table = this.$('.planning-mrp-lineOrders-table');

      if (_.isEmpty(this.plan.displayOptions.get('whStatuses'))
        && _.isEmpty(this.plan.displayOptions.get('psStatuses'))
        && this.plan.displayOptions.get('from') === '06:00'
        && this.plan.displayOptions.get('to') === '06:00')
      {
        $table.find('.planning-wh-newLine-tr.hidden').removeClass('hidden');
        $table.find('.planning-wh-newGroup-tr.hidden').removeClass('hidden');

        return;
      }

      var row = $table[0].tBodies[0].firstElementChild;

      if (!row)
      {
        return;
      }

      var groupNo = '';
      var groupLine = '';
      var groups = {};

      do
      {
        if (row.dataset.id)
        {
          groupNo = row.dataset.group;
          groupLine = row.dataset.line;

          if (!groups[groupNo])
          {
            groups[groupNo] = {
              lines: {},
              separator: null,
              empty: true
            };
          }

          if (!groups[groupNo].lines[groupLine])
          {
            groups[groupNo].lines[groupLine] = {
              separator: null,
              empty: true
            };
          }

          var hidden = row.classList.contains('hidden');

          groups[groupNo].lines[groupLine].empty = hidden && groups[groupNo].lines[groupLine].empty;
          groups[groupNo].empty = hidden && groups[groupNo].empty;
        }
        else if (row.classList.contains('planning-wh-newLine-tr'))
        {
          groups[groupNo].lines[groupLine].separator = row;
        }
        else if (row.classList.contains('planning-wh-newGroup-tr'))
        {
          groups[groupNo].separator = row;
        }

        row = row.nextElementSibling;
      }
      while (row);

      _.forEach(groups, function(group)
      {
        if (group.separator)
        {
          group.separator.classList.toggle('hidden', group.empty);
        }

        var lastLine = null;
        var lastSeparator = null;

        _.forEach(group.lines, function(line)
        {
          if (line.separator)
          {
            line.separator.classList.toggle('hidden', line.empty);

            if (!line.empty)
            {
              lastSeparator = line.separator;
            }
          }

          lastLine = line;
        });

        if (lastSeparator && lastLine.empty)
        {
          lastSeparator.classList.add('hidden');
        }
      });
    }

  });
});
