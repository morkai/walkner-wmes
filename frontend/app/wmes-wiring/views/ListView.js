// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/data/clipboard',
  '../WiringOrderCollection',
  'app/wmes-wiring/templates/list',
  'app/wmes-wiring/templates/listRow',
  'app/wmes-wiring/templates/action',
  'jquery.stickytableheaders'
], function(
  _,
  $,
  user,
  viewport,
  View,
  clipboard,
  WiringOrderCollection,
  listTemplate,
  listRowTemplate,
  actionTemplate
) {
  'use strict';

  return View.extend({

    template: listTemplate,

    events: {
      'click td': function(e)
      {
        var view = this;
        var cell = e.currentTarget;
        var content = cell.dataset.popover;

        if (view.$popover && view.$popover[0] === cell && view.$popover.data('sticky'))
        {
          view.hidePopover();

          return;
        }

        view.hidePopover(true);

        if (!content)
        {
          return;
        }

        content = content.split(' ');

        var clipboard = content.join('\n');

        if (cell.dataset.columnId === 'leadingOrders' && user.isAllowedTo('ORDERS:VIEW'))
        {
          content = content.map(function(orderNo)
          {
            return '<a href="#orders/' + orderNo + '" target="_blank">' + orderNo + '</a>';
          });
        }

        view.$popover = view.$(cell).popover({
          container: document.body,
          placement: 'right',
          trigger: 'manual',
          html: true,
          content: content.join(', ')
        });

        view.$popover
          .data('sticky', true)
          .data('clipboard', clipboard)
          .popover('show');
      },
      'mouseenter td': function(e)
      {
        var view = this;
        var cell = e.currentTarget;

        if (view.$popover && view.$popover[0] === cell)
        {
          return;
        }

        var content = cell.dataset.popover;

        if (!content || content.indexOf(' ') === -1)
        {
          return;
        }

        view.hidePopover();

        view.$popover = view.$(cell).popover({
          container: document.body,
          placement: 'right',
          trigger: 'manual',
          content: content.replace(/ /g, ', ')
        });

        view.$popover
          .data('sticky', false)
          .data('clipboard', content.replace(/ /g, '\n'))
          .popover('show');
      },
      'mouseleave td': function()
      {
        if (this.$popover && !this.$popover.data('sticky'))
        {
          this.hidePopover();
        }
      },
      'click .btn': function(e)
      {
        this.handleAction(e.currentTarget.dataset.action, this.$(e.target).closest('tr')[0].dataset.nc12);
      }
    },

    modelProperty: 'orders',

    initialize: function()
    {
      this.lastNc12 = null;
      this.lastColumnId = null;
      this.renderRow = this.renderPartialHtml.bind(this, listRowTemplate);

      this.once('afterRender', this.defineBindings);
    },

    destroy: function()
    {
      $(window).off('keydown.' + this.idPrefix);

      this.$('.table').stickyTableHeaders('destroy');

      this.hidePopover(true);
    },

    defineBindings: function()
    {
      this.listenTo(this.orders, 'reset add remove filter:status filter:mrp', _.debounce(this.render.bind(this), 1));
      this.listenTo(this.orders, 'change', this.onChange);

      $(window)
        .on('keydown.' + this.idPrefix, this.onKeyDown.bind(this))
        .on('click.' + this.idPrefix, this.onMouseClick.bind(this));
    },

    getTemplateData: function()
    {
      return {
        canUpdate: this.orders.canUpdate(),
        renderRow: this.renderRow,
        rows: this.serializeRows(null)
      };
    },

    serializeRows: function(nc12Filter)
    {
      var filters = this.orders.filters;

      if (filters.mrp === 'all')
      {
        return this.groupRows(nc12Filter);
      }

      return this.orders.serialize().filter(function(row)
      {
        return (!nc12Filter || row.nc12 === nc12Filter)
          && row.mrp === filters.mrp
          && (filters.status.length === 0 || _.includes(filters.status, row.status));
      });
    },

    groupRows: function(nc12Filter)
    {
      var view = this;
      var ungroupedRows = view.orders.serialize();
      var groupedUngrouped = {};
      var allGroupedRows = {};

      ungroupedRows.forEach(function(row)
      {
        if (nc12Filter && row.nc12 !== nc12Filter)
        {
          return;
        }

        if (!groupedUngrouped[row.nc12])
        {
          groupedUngrouped[row.nc12] = [];
        }

        groupedUngrouped[row.nc12].push(row);
      });

      _.forEach(groupedUngrouped, function(rows)
      {
        var allCancelled = true;

        rows.forEach(function(row)
        {
          allCancelled = allCancelled && row.status === 'cancelled';
        });

        rows.forEach(function(row)
        {
          var groupedRow = allGroupedRows[row.nc12];

          if (!groupedRow)
          {
            groupedRow = allGroupedRows[row.nc12] = _.clone(row);
            groupedRow.mrps = {};
            groupedRow.leadingOrders = {};

            if (row.status === 'cancelled' && !allCancelled)
            {
              groupedRow.qty = 0;
            }
          }
          else
          {
            groupedRow.status = view.resolveStatus(groupedRow.status, row.status);

            if (row.status !== 'cancelled' || allCancelled)
            {
              groupedRow.qty += row.qty;
            }

            groupedRow.qtyDone += row.qtyDone;

            if (!groupedRow.startedAt || row.startedAt < groupedRow.startedAt)
            {
              groupedRow.startedAt = row.startedAt;
            }

            if (!groupedRow.finishedAt || row.finishedAt > groupedRow.finishedAt)
            {
              groupedRow.finishedAt = row.finishedAt;
            }

            if (!groupedRow.actionInProgress)
            {
              groupedRow.actionInProgress = row.actionInProgress;
            }
          }

          row.mrps.forEach(function(mrp) { groupedRow.mrps[mrp] = 1; });
          row.leadingOrders.forEach(function(orderNo) { groupedRow.leadingOrders[orderNo] = 1; });
        });
      });

      var filteredGroupedRows = [];
      var statusFilter = view.orders.filters.status;

      _.forEach(allGroupedRows, function(row)
      {
        if (statusFilter.length && !_.includes(statusFilter, row.status))
        {
          return;
        }

        row.mrps = Object.keys(row.mrps).sort();
        row.leadingOrders = Object.keys(row.leadingOrders).sort();

        filteredGroupedRows.push(row);
      });

      return filteredGroupedRows;
    },

    resolveStatus: function(a, b)
    {
      if (a === b)
      {
        return a;
      }

      var statuses = [a, b].sort(function(a, b)
      {
        return WiringOrderCollection.STATUS_ORDERS[a] - WiringOrderCollection.STATUS_ORDERS[b];
      });

      a = statuses[0];
      b = statuses[1];

      if (a === 'new')
      {
        if (b === 'cancelled')
        {
          return a;
        }

        if (b === 'started')
        {
          return b;
        }

        return 'partial';
      }

      return a;
    },

    beforeRender: function()
    {
      this.hidePopover(true);
    },

    afterRender: function()
    {
      this.$('.table').stickyTableHeaders({fixedOffset: $('.navbar-fixed-top')});
    },

    onChange: function(order)
    {
      var view = this;
      var nc12 = order.get('nc12');
      var rows = view.serializeRows(nc12);

      var $row = view.$('.wiring-list-item[data-nc12="' + nc12 + '"]');

      if (!rows.length)
      {
        $row.fadeOut('fast', function() { $row.remove(); });

        return;
      }

      var html = view.renderRow({
        canUpdate: view.orders.canUpdate(),
        row: rows[0]
      });

      if ($row.length)
      {
        $row.replaceWith(html);
      }
      else
      {
        $(html).css({display: 'none'}).appendTo(view.$('tbody')).fadeIn('fast');
      }
    },

    onKeyDown: function(e)
    {
      if (e.ctrlKey && e.key.toUpperCase() === 'C')
      {
        this.handleCopy(e);
      }

      if (e.key === 'Escape')
      {
        this.hidePopover();
        this.hideEditor();

        var now = Date.now();

        if (this.lastEscapeAt && now - this.lastEscapeAt < 500)
        {
          this.orders.setStatusFilter([]);
          this.orders.setMrpFilter('all');
        }

        this.lastEscapeAt = now;
      }
    },

    onMouseClick: function(e)
    {
      var $target = $(e.target);

      if (!$target.closest('.wiring-list-editor-popover').length
        && !$target.closest('.actions').length)
      {
        this.hideEditor();
      }
    },

    handleCopy: function(e)
    {
      var view = this;

      if (window.getSelection().toString() !== '' || !view.$popover)
      {
        return;
      }

      e.preventDefault();

      var prop = view.$popover[0].dataset.columnId;
      var data = view.$popover.data('clipboard').replace(/ /g, '\n');

      view.copyProp(prop, data);
    },

    copyProp: function(prop, data)
    {
      var view = this;

      clipboard.copy(function(clipboardData)
      {
        clipboardData.setData('text/plain', data);

        if (view.$clipboardMsg)
        {
          viewport.msg.hide(view.$clipboardMsg, true);
        }

        view.$clipboardMsg = viewport.msg.show({
          type: 'info',
          time: 1500,
          text: view.t('msg:clipboard:' + prop)
        });
      });
    },

    hidePopover: function(immediate)
    {
      if (!this.$popover)
      {
        return;
      }

      var popover = this.$popover.data('bs.popover');

      if (immediate && popover)
      {
        popover.tip().removeClass('fade');
      }

      this.$popover.popover('destroy').removeData('sticky');
      this.$popover = null;
    },

    handleAction: function(action, nc12)
    {
      this.hideEditor();

      switch (action)
      {
        case 'start':
          this.act(action, nc12);
          break;

        case 'continue':
        case 'cancel':
        case 'reset':
        case 'finish':
          this.showActionPopover(action, nc12);
          break;
      }
    },

    hideEditor: function()
    {
      var $editor = $('.wiring-list-editor-popover');

      if (!$editor.length)
      {
        return;
      }

      var $action = this.$('.btn[aria-describedby="' + $editor[0].id + '"]');

      $action.popover('destroy');
    },

    showActionPopover: function(action, nc12)
    {
      var view = this;
      var row = view.serializeRows(nc12)[0];

      if (!row)
      {
        return;
      }

      var $action = view.$('.wiring-list-item[data-nc12="' + nc12 + '"]').find('.btn[data-action="' + action + '"]');

      $action.popover({
        container: document.body,
        placement: 'right',
        trigger: 'manual',
        html: true,
        title: function() { return ''; },
        content: this.renderPartialHtml(actionTemplate, {
          action: action,
          qtyDone: row.qtyDone < row.qty ? row.qty : row.qtyDone === row.qty ? 0 : row.qtyDone,
          qty: row.qty
        }),
        className: 'wiring-list-editor-popover'
      });

      $action.popover('show');

      var $form = $action.data('bs.popover').tip().find('form');

      $form.on('submit', function()
      {
        view.hideEditor();
        view.act(action, nc12, $form.find('.form-control').val() || '');

        return false;
      });

      $form.find('.btn-danger').on('click', function()
      {
        view.hideEditor();
      });

      if (action === 'finish')
      {
        $form.find('.form-control').select();
      }
      else
      {
        $form.find('.btn-success').focus();
      }
    },

    act: function(action, nc12, newQtyDone)
    {
      var finish = action === 'finish';

      if (finish && !newQtyDone)
      {
        return;
      }

      viewport.msg.saving();

      var mrpFilter = this.orders.filters.mrp;
      var orders = this.orders.filter(function(order)
      {
        return order.get('nc12') === nc12 && (mrpFilter === 'all' || order.get('mrp') === mrpFilter);
      });
      var oldQtyDone = 0;

      orders.forEach(function(order)
      {
        oldQtyDone += order.get('qtyDone');
      });

      if (finish)
      {
        newQtyDone = (newQtyDone.charAt(0) === '+' ? oldQtyDone : 0) + parseInt(newQtyDone, 10);
      }

      var reqQueue = [];

      orders.forEach(function(order, i)
      {
        var qtyDone;

        if (finish)
        {
          var qty = order.get('qty');

          if ((i + 1) === orders.length)
          {
            qtyDone = newQtyDone >= 0 ? newQtyDone : 0;
          }
          else if (newQtyDone > 0)
          {
            qtyDone = newQtyDone >= qty ? qty : newQtyDone;
          }
          else
          {
            qtyDone = 0;
          }

          newQtyDone -= qty;
        }
        else if (orders.length > 1)
        {
          var status = order.get('status');

          if (action === 'continue' && status === 'finished')
          {
            return;
          }

          if (action !== 'reset' && status === 'cancelled')
          {
            return;
          }
        }

        reqQueue.push({
          action: action,
          orderId: order.id,
          qtyDone: qtyDone
        });

        order.set('actionInProgress', action);
      });

      if (reqQueue.length)
      {
        this.actNext(nc12, reqQueue);
      }
    },

    actNext: function(nc12, reqQueue)
    {
      var view = this;
      var reqData = reqQueue.shift();

      view.orders.act(reqData, function(err)
      {
        var order = view.orders.get(reqData.orderId);

        if (order)
        {
          order.set('actionInProgress', null);
        }

        if (err)
        {
          viewport.msg.savingFailed();
        }
        else if (reqQueue.length)
        {
          view.actNext(nc12, reqQueue);
        }
        else
        {
          viewport.msg.saved();
        }
      });
    }

  });
});
