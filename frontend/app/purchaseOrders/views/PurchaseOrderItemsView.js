// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/Model',
  'app/core/View',
  './PurchaseOrderPrintDialogView',
  'app/purchaseOrders/templates/items',
  'app/purchaseOrders/templates/printsPopover'
], function(
  _,
  $,
  t,
  user,
  viewport,
  Model,
  View,
  PurchaseOrderPrintDialogView,
  template,
  renderPrintsPopover
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'mouseover .pos-items-item': 'highlightItemScheduleRows',
      'mouseout .pos-items-item': 'highlightItemScheduleRows',
      'mouseover .pos-items-item-schedule': 'highlightItemRow',
      'mouseout .pos-items-item-schedule': 'highlightItemRow',
      'click .popover': function(e)
      {
        return e.target.classList.contains('popover-title');
      },
      'change [name=status]': function()
      {
        this.state.set('statuses', this.$('[name=status]:checked').map(function() { return this.value; }).get());
      },
      'click .is-clickable': function(e)
      {
        this.showItemPrints(e.currentTarget.parentNode.dataset.itemId);

        return false;
      },
      'click .is-selectable': function(e)
      {
        if (this.state.get('printing'))
        {
          return;
        }

        var selected = this.state.get('selected');
        var itemId = e.currentTarget.dataset.itemId;

        if (selected.indexOf(itemId) === -1)
        {
          this.state.set('selected', [itemId].concat(selected));
        }
        else
        {
          this.state.set('selected', _.without(selected, itemId));
        }
      },
      'click #-selectAll': function()
      {
        var selected = this.model.get('items')
          .where({completed: false})
          .map(function(item) { return item.id; });

        this.state.set('selected', selected);
      },
      'click #-selectNone': function()
      {
        this.state.set('selected', []);
      },
      'click #-print': 'showPrintDialog',
      'click .action-showPrintPdf': function(e)
      {
        this.showPrintPdf(this.$(e.currentTarget).closest('tr').attr('data-print-id'));
      },
      'click .action-toggleCancelled': function(e)
      {
        this.toggleCancelledPrint(this.$(e.currentTarget).closest('tr').attr('data-print-id'));
      }
    },

    initialize: function()
    {
      this.onBodyClick = this.onBodyClick.bind(this);
      this.deferRender = _.debounce(this.render.bind(this), 1);

      this.state = new Model({
        printing: false,
        statuses: null,
        selected: []
      });
      this.print = new Model({
        orderId: null,
        shippingNo: '',
        paper: localStorage.getItem('POS:PAPER') || 'a4',
        barcode: localStorage.getItem('POS:BARCODE') || 'code128',
        items: []
      });
      this.printWindow = null;
      this.$msg = null;
      this.$popover = null;
      this.lastPopoverId = null;

      this.listenTo(this.state, 'change:printing', this.togglePrintingStatus);
      this.listenTo(this.state, 'change:selected', this.toggleItemSelection);
      this.listenTo(this.state, 'change:statuses', this.toggleItemVisibility);

      $('body').on('click', this.onBodyClick);
    },

    destroy: function()
    {
      $('body').off('click', this.onBodyClick);

      this.hideMessage();
      this.hidePopover(true);

      this.state = null;
      this.print = null;
      this.printWindow = null;
    },

    serialize: function()
    {
      var po = this.model;
      var waitingCount = 0;
      var completedCount = 0;
      var items = po.get('items').map(function(item)
      {
        if (item.get('completed'))
        {
          ++completedCount;
        }
        else
        {
          ++waitingCount;
        }

        return item.serialize();
      });

      return {
        idPrefix: this.idPrefix,
        toolbarVisible: po.get('open') && user.isAllowedTo('PURCHASE_ORDERS:MANAGE'),
        open: po.get('open'),
        items: items,
        itemToPrints: this.model.prints.byItem,
        waitingCount: waitingCount.toLocaleString(),
        completedCount: completedCount.toLocaleString()
      };
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change:open', this.deferRender);
      this.stopListening(this.model.get('items'), 'change', this.deferRender);

      if (this.$popover !== null)
      {
        this.lastPopoverId = this.$popover.data('itemId');
        this.lastPopoverScrollTop = this.$('.popover-content').prop('scrollTop');
        this.hidePopover(true);
      }
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:open', this.deferRender);
      this.listenToOnce(this.model.get('items'), 'change', this.deferRender);

      if (this.model.get('open'))
      {
        this.fixLastItemRow();
        this.fixToolbarState();
        this.togglePrintingStatus();
        this.toggleItemVisibility();
        this.toggleItemSelection();
      }

      if (this.lastPopoverId !== null)
      {
        this.$('.pos-items-item[data-item-id="' + this.lastPopoverId + '"]').find('.is-clickable').click();
        this.$('.popover-content').prop('scrollTop', this.lastPopoverScrollTop);
        this.lastPopoverId = null;
        this.lastPopoverScrollTop = 0;
      }
    },

    hideMessage: function()
    {
      if (this.$msg !== null)
      {
        viewport.msg.hide(this.$msg);
        this.$msg = null;
      }
    },

    hidePopover: function(destroy)
    {
      if (this.$popover !== null)
      {
        this.$popover.popover(destroy ? 'destroy' : 'hide');
        this.$popover = null;
      }
    },

    fixLastItemRow: function()
    {
      var items = this.model.get('items');
      var lastItem = items.last();

      if (lastItem.completed)
      {
        return;
      }

      var schedule = lastItem.get('schedule');

      if (schedule.length === 1)
      {
        return;
      }

      this.$('.pos-items-item').last().addClass('is-last');
    },

    fixToolbarState: function()
    {
      var $toolbar = this.$('.btn-toolbar');

      (this.state.get('statuses') || []).forEach(function(status)
      {
        $toolbar.find('input[value=' + status + ']').attr('checked', true).parent().addClass('active');
      });
    },

    toggleItemVisibility: function()
    {
      if (!this.model.get('open'))
      {
        return this.$('.hidden').removeClass('hidden');
      }

      var statuses = this.state.get('statuses');
      var $statuses = this.$('input[name=status]');

      if (statuses === null)
      {
        $statuses.filter('[value=waiting]').attr('checked', true).parent().addClass('active');

        statuses = ['waiting'];

        this.state.set('statuses', ['waiting'], {silent: true});
      }

      var view = this;

      $statuses.each(function()
      {
        view.$('.is-' + this.value).toggleClass('hidden', !this.checked);
      });

      var notWaiting = statuses.indexOf('waiting') === -1;

      if (notWaiting)
      {
        this.state.set('selected', []);
      }

      var printing = this.state.get('printing');

      this.$id('selectAll').prop('disabled', printing || notWaiting);
      this.$id('selectNone').prop('disabled', printing || notWaiting);
    },

    toggleItemSelection: function()
    {
      this.$('.is-selected').removeClass('is-selected');

      var selected = this.state.get('selected');
      var printing = this.state.get('printing');

      this.$id('print').prop('disabled', printing || !selected.length);

      if (!selected.length)
      {
        return;
      }

      this.$('.is-selectable > .pos-rowSeparator').each(function()
      {
        if (selected.indexOf(this.parentNode.dataset.itemId) !== -1)
        {
          this.classList.add('is-selected');

          var tr = this.parentNode;

          while (tr.nextElementSibling)
          {
            tr = tr.nextElementSibling;

            if (!tr.classList.contains('pos-items-item') && !tr.classList.contains('pos-items-item-schedule'))
            {
              break;
            }

            tr.classList.add('is-selected');
          }
        }
      });
    },

    togglePrintingStatus: function()
    {
      var printing = this.state.get('printing');

      this.$id('statuses').find('.btn').toggleClass('disabled', printing);
      this.$id('selectAll').prop('disabled', printing);
      this.$id('selectNone').prop('disabled', printing);
      this.$id('print').prop('disabled', true);
      this.$el.toggleClass('is-printing', printing);

      if (!printing)
      {
        this.state.set('selected', []);
      }
    },

    highlightItemScheduleRows: function(e)
    {
      this.$('.is-hovered').removeClass('is-hovered');

      var rowEl = e.currentTarget;
      var nextRowsToHighlight = rowEl.dataset.scheduleLength - 1;

      if (nextRowsToHighlight === 0 || e.type === 'mouseout')
      {
        return;
      }

      for (var i = 0; i < nextRowsToHighlight; ++i)
      {
        rowEl = rowEl.nextElementSibling;
        rowEl.classList.add('is-hovered');
      }
    },

    highlightItemRow: function(e)
    {
      var rowEl = e.currentTarget;

      while (true)
      {
        rowEl = rowEl.previousElementSibling;

        if (rowEl === null)
        {
          break;
        }

        rowEl.classList.toggle('is-hovered');

        if (rowEl.classList.contains('pos-items-item'))
        {
          break;
        }
      }

      rowEl = e.currentTarget;

      while (true)
      {
        rowEl = rowEl.nextElementSibling;

        if (rowEl === null || rowEl.classList.contains('pos-items-item'))
        {
          break;
        }

        rowEl.classList.toggle('is-hovered');
      }
    },

    showPrintDialog: function()
    {
      this.$id('print').blur();

      viewport.msg.loading();

      var view = this;
      var allItems = this.model.get('items');
      var selectedItems = this.state.get('selected').map(function(itemId)
      {
        var item = allItems.get(itemId);

        return {
          _id: +item.id,
          nc12: item.get('nc12'),
          packageQty: 0,
          componentQty: 0,
          remainingQty: item.get('schedule')[0].qty
        };
      }).sort(function(a, b) { return a._id - b._id; });

      var req = this.ajax({
        type: 'GET',
        url: '/purchaseOrders;getLatestComponentQty',
        data: {
          nc12: _.unique(_.pluck(selectedItems, 'nc12'))
        }
      });

      req.always(function(res, result)
      {
        var nc12ToComponentQty = result === 'success' ? res : {};

        selectedItems.forEach(function(item)
        {
          var componentQty = nc12ToComponentQty[item.nc12];

          if (!componentQty || item.remainingQty < componentQty)
          {
            return;
          }

          item.packageQty = Math.floor(item.remainingQty / componentQty);
          item.componentQty = componentQty;
          item.remainingQty = item.remainingQty % componentQty;
        });

        view.print.set({
          orderId: view.model.id,
          items: selectedItems
        });

        var dialogView = new PurchaseOrderPrintDialogView({model: view.print});

        view.listenToOnce(dialogView, 'print', view.onPrintRequest.bind(view));

        viewport.msg.loaded();
        viewport.showDialog(dialogView, t('purchaseOrders', 'printDialog:title'));
      });
    },

    onPrintRequest: function(printId)
    {
      this.state.set('printing', true);

      this.broker.subscribe('viewport.dialog.hidden', this.openPrintPopup.bind(this, printId)).setLimit(1);

      viewport.closeDialog();
    },

    openPrintPopup: function(printId)
    {
      var url = '/purchaseOrders/' + this.model.id + '/prints/' + printId + '.pdf+html';
      var windowName = 'WMES_PO_LABEL_PRINTING';
      var screen = window.screen;
      var width = screen.availWidth * 0.6;
      var height = screen.availHeight * 0.8;
      var left = Math.floor((screen.availWidth - width) / 2);
      var top = Math.floor((screen.availHeight - height) / 2);
      var windowFeatures = 'resizable,scrollbars,location=no'
        + ',top=' + top
        + ',left=' + left
        + ',width=' + Math.floor(width)
        + ',height=' + Math.floor(height);

      this.printWindow = window.open(url, windowName, windowFeatures);

      if (this.printWindow)
      {
        var view = this;

        this.printWindow.onbeforeunload = window.WMES_PO_PRINT_DONE = function()
        {
          view.printWindow.onbeforeunload = null;
          view.printWindow = null;

          delete window.WMES_PO_PRINT_DONE;

          view.state.set('printing', false);
        };
      }
      else
      {
        this.$msg = viewport.msg.show({
          type: 'error',
          time: 6000,
          text: t('purchaseOrders', 'printDialog:msg:blocked')
        });

        this.state.set('printing', false);
      }
    },

    showItemPrints: function(itemId)
    {
      var lastItemId = null;

      if (this.$popover !== null)
      {
        lastItemId = this.$popover.data('itemId');

        this.hidePopover(false);
      }

      if (itemId === lastItemId)
      {
        return;
      }

      this.$popover = this.$('.pos-items-item[data-item-id="' + itemId + '"]')
        .find('.pos-items-item-prints')
        .data('itemId', itemId);

      this.$popover.popover({
        animation: this.lastPopoverId === null,
        trigger: 'manual',
        html: true,
        title: t('purchaseOrders', 'prints:title'),
        content: renderPrintsPopover({
          orderId: this.model.id,
          prints: this.model.prints.byItem[itemId].map(function(print) { return print.toJSON(); })
        })
      });

      this.$popover.popover('show');
    },

    onBodyClick: function()
    {
      this.hidePopover(false);
    },

    showPrintPdf: function(printId)
    {
      window.open('/purchaseOrders/' + this.model.id + '/prints/' + printId + '.pdf');
    },

    toggleCancelledPrint: function(printId)
    {
      var $print = this.$('.pos-prints-print[data-print-id="' + printId + '"]');
      var $action = $print.find('.action-toggleCancelled');

      $action.prop('disabled', true);

      var print = this.model.prints.get(printId);

      var req = this.ajax({
        type: 'POST',
        url: '/purchaseOrders/' + this.model.id + '/prints/' + printId + ';cancel',
        data: JSON.stringify({
          cancelled: !print.get('cancelled')
        })
      });

      req.always(function()
      {
        $action.prop('disabled', false);
      });
    }

  });
});
