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
      view.listenTo(sapOrders, 'change:statuses', view.onStatusesChanged);

      view.listenTo(view.whOrders, 'reset', view.onOrdersReset);
      view.listenTo(view.whOrders, 'change', view.onOrderChanged);

      view.listenTo(view.whLines, 'change', view.onLineChanged);
      view.listenTo(view.whLines, 'change:redirLine', view.onRedirLineChanged);

      view.listenTo(plan.displayOptions, 'change:whStatuses', view.toggleOrderRowVisibility);
      view.listenTo(plan.displayOptions, 'change:psStatuses', view.toggleOrderRowVisibility);
      view.listenTo(plan.displayOptions, 'change:distStatuses', view.toggleOrderRowVisibility);
      view.listenTo(plan.displayOptions, 'change:from change:to', view.toggleOrderRowVisibility);
      view.listenTo(
        plan.displayOptions,
        'change:orders change:lines change:mrps change:sets',
        _.debounce(view.toggleOrderRowVisibility.bind(view), 1)
      );

      $(window)
        .on('scroll.' + view.idPrefix, view.positionStickyHeaders.bind(view))
        .on('resize.' + view.idPrefix, view.adjustStickyHeaders.bind(view));
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

    $row: function(whOrder, sapOrder)
    {
      var selector = 'tr';

      if (whOrder)
      {
        selector += '[data-id="' + whOrder + '"]';
      }

      if (sapOrder)
      {
        selector += '[data-order="' + sapOrder + '"]';
      }

      return this.$(selector);
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
          return view.renderPopoverContent(this);
        }
      });
    },

    renderPopoverContent: function(el)
    {
      var view = this;
      var whOrder = view.whOrders.get($(el).closest('.wh-list-item')[0].dataset.id);

      if (!whOrder)
      {
        return '';
      }

      var columnId = el.dataset.columnId;

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
        qtyPerLine: [],
        timePerLine: [],
        startedAt: '',
        duration: ''
      };

      switch (columnId)
      {
        case 'qty':
          templateData.qtyPerLine = whOrder.get('lines').map(function(line)
          {
            return {
              line: line._id,
              qty: line.qty,
              max: whOrder.get('qty')
            };
          });
          break;

        case 'startTime':
        case 'finishTime':
          templateData.timePerLine = whOrder.get('lines').map(function(line)
          {
            return {
              line: line._id,
              startTime: line.startTime ? time.utc.format(line.startTime, 'HH:mm:ss') : '?',
              finishTime: line.finishTime ? time.utc.format(line.finishTime, 'HH:mm:ss') : '?'
            };
          });
          break;

        case 'fifoStatus':
        case 'packStatus':
          templateData.status = view.t('status:' + whOrder.get(columnId));
          break;

        case 'psDistStatus':
          var psDistStatus = whOrder.get(columnId);

          if (whOrder.get('psStatus') === 'unknown')
          {
            psDistStatus = 'ignored';
          }

          templateData.status = view.t('status:' + psDistStatus);
          break;

        case 'picklist':
          var picklistFunc = whOrder.getFunc(whOrder.get('picklistFunc'));
          var picklistDone = whOrder.get('picklistDone');

          if (picklistDone !== 'pending')
          {
            templateData.user = picklistFunc && picklistFunc.user ? picklistFunc.user.label : null;
            templateData.status = view.t('status:picklistDone:' + picklistDone);
          }
          else
          {
            templateData.status = view.t('status:pending');
          }

          var startedAt = Date.parse(whOrder.get('startedAt'));

          if (startedAt)
          {
            var finishedAt = Date.parse(whOrder.get('finishedAt'));

            templateData.startedAt = time.format(startedAt, 'L LT');

            if (finishedAt)
            {
              templateData.duration = time.toString((finishedAt - startedAt) / 1000);
            }
          }
          break;

        case 'fmx':
        case 'kitter':
        case 'platformer':
        case 'packer':
        case 'painter':
          var func = whOrder.getFunc(columnId);

          templateData.status = view.t('status:' + func.status);
          templateData.carts = func.carts;
          templateData.problemArea = func.problemArea;
          templateData.comment = func.comment;

          if (func.user)
          {
            templateData.user = func.user.label;
          }

          if (func.startedAt)
          {
            templateData.startedAt = time.format(func.startedAt, 'L LT');

            if (func.finishedAt)
            {
              templateData.duration = time.toString((Date.parse(func.finishedAt) - Date.parse(func.startedAt)) / 1000);
            }
          }
          break;
      }

      return view.renderPartial(popoverTemplate, templateData);
    },

    setUpStickyHeaders: function()
    {
      this.$stickyHeaders = $('<div class="planning-wh-list wh-list-sticky hidden"></div>').html(
        '<table class="planning-mrp-lineOrders-table">'
        + this.$('thead').first()[0].outerHTML
        + '</table>'
      );

      this.adjustStickyHeaders();
      this.positionStickyHeaders();

      var $body = $(document.body);

      $body.find('.wh-list-sticky').remove();
      $body.append(this.$stickyHeaders);

      this.$el.on('scroll', this.scrollStickyHeaders.bind(this));
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

      this.$stickyHeaders[0].classList.toggle('hidden', window.scrollY <= this.el.offsetTop);
    },

    scrollStickyHeaders: function()
    {
      if (!this.$stickyHeaders)
      {
        return;
      }

      var left = 15;
      var listEl = this.el;
      var stickyEl = this.$stickyHeaders[0];

      if (Math.abs(listEl.scrollWidth - listEl.clientWidth) > 1)
      {
        left -= listEl.scrollLeft;
      }

      stickyEl.style.left = left + 'px';
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

        $btn.tooltip('show');
        $btn.data('bs.tooltip').tip().addClass('result success').css({
          left: x + 'px',
          top: y + 'px'
        });

        setTimeout(function() { $btn.tooltip('destroy'); }, 1337);
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
        this.$row(null, sapOrder.id).find('.planning-mrp-lineOrders-comment').html(
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
      var $order = this.$row(null, sapOrder.id);

      if ($order.length)
      {
        var psStatus = this.plan.sapOrders.getPsStatus(sapOrder.id);

        $order
          .find('.planning-mrp-list-property-psStatus')
          .attr('title', t('planning', 'orders:psStatus:' + psStatus))
          .attr('data-ps-status', psStatus);
      }
    },

    onStatusesChanged: function(sapOrder)
    {
      var view = this;

      view.$('.wh-list-item[data-order="' + sapOrder.id + '"]').each(function()
      {
        view.onOrderChanged(view.whOrders.get(this.dataset.id));
      });
    },

    onOrderChanged: function(whOrder)
    {
      var $tr = this.$row(whOrder.id);

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

        var $tr = view.$row(whOrder.id);
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

        var $tr = this.$row(whOrder.id);

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

    toggleOrderRowVisibility: function()
    {
      var view = this;
      var filters = view.whOrders.getFilters(view.plan);

      view.$('.wh-list-item').each(function()
      {
        var whOrder = view.whOrders.get(this.dataset.id);

        if (!whOrder)
        {
          this.parentNode.removeChild(this);

          return;
        }

        var startTime = +this.dataset.startTime;
        var hidden = startTime < filters.startTime.from || startTime >= filters.startTime.to;

        if (!hidden && filters.whStatuses.length)
        {
          hidden = filters.whStatuses.indexOf(whOrder.get('status')) === -1;
        }

        if (!hidden && filters.psStatuses.length)
        {
          hidden = filters.psStatuses.indexOf(whOrder.get('psStatus')) === -1;
        }

        if (!hidden && filters.distStatuses.length)
        {
          hidden = filters.distStatuses.indexOf(whOrder.get('distStatus')) === -1;
        }

        if (!hidden && filters.orders.length)
        {
          hidden = filters.orders.indexOf(whOrder.get('order')) === -1;
        }

        if (!hidden && filters.lines.length)
        {
          hidden = whOrder.get('lines').every(function(l) { return !filters.lines.includes(l._id); });
        }

        if (!hidden && filters.mrps.length)
        {
          hidden = filters.mrps.indexOf(whOrder.get('mrp')) === -1;
        }

        if (!hidden && filters.sets.length)
        {
          hidden = filters.sets.indexOf(whOrder.get('set')) === -1;
        }

        this.classList.toggle('hidden', hidden);
      });

      view.toggleSeparatorRowVisibility();
    },

    toggleSeparatorRowVisibility: function()
    {
      var options = this.plan.displayOptions;
      var $table = this.$('.planning-mrp-lineOrders-table');

      if (_.isEmpty(options.get('whStatuses'))
        && _.isEmpty(options.get('psStatuses'))
        && _.isEmpty(options.get('distStatuses'))
        && _.isEmpty(options.get('orders'))
        && _.isEmpty(options.get('lines'))
        && _.isEmpty(options.get('mrps'))
        && _.isEmpty(options.get('sets'))
        && options.get('from') === '06:00'
        && options.get('to') === '06:00')
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
          if (groups[groupNo] && groups[groupNo].lines[groupLine])
          {
            groups[groupNo].lines[groupLine].separator = row;
          }
        }
        else if (groups[groupNo] && row.classList.contains('planning-wh-newGroup-tr'))
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
