// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/purchaseOrders/templates/details'
], function(
  $,
  t,
  View,
  detailsTemplate
) {
  'use strict';

  return View.extend({

    template: detailsTemplate,

    className: 'pos-details',

    events: {
      'mouseover .pos-details-item': 'highlightItemScheduleRows',
      'mouseout .pos-details-item': 'highlightItemScheduleRows',
      'mouseover .pos-details-item-schedule': 'highlightItemRow',
      'mouseout .pos-details-item-schedule': 'highlightItemRow',
      'click .action-print': 'onPrintActionClick',
      'submit .pos-printDialog': 'onPrintDialogSubmit',
      'change input[name="status[]"]': 'onItemStatusFilterChange',
      'click .pos-details-changes-more': 'showAllChanges'
    },

    initialize: function()
    {
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onResize = this.onResize.bind(this);

      this.$printDialog = null;
      this.printing = false;

      $('body').on('keydown', this.onKeyDown);
      $(window).on('resize', this.onResize);
    },

    destroy: function()
    {
      this.$printDialog = null;

      $('body').off('keydown', this.onKeyDown);
      $(window).off('resize', this.onResize);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        model: this.model.serialize()
      };
    },

    afterRender: function()
    {
      if (this.model.get('open'))
      {
        this.fixLastItemRow();
        this.hideCompletedItems();
      }

      this.$printDialog = this.$id('printDialog');

      this.$id('pdfPreview').on('load', this.onPdfPreviewLoad.bind(this));

      this.$id('quantityHelp').popover({
        trigger: 'hover',
        placement: 'top',
        html: true,
        content: t('purchaseOrders', 'printDialog:quantityHelp')
      });

      this.$('.pos-details-change').last().addClass('is-last');
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

      this.$('.pos-details-item').last().addClass('is-last');
    },

    hideCompletedItems: function()
    {
      this.$('.is-completed').hide();
    },

    highlightItemScheduleRows: function(e)
    {
      var rowEl = e.currentTarget;
      var nextRowsToHighlight = rowEl.dataset.scheduleLength - 1;

      if (nextRowsToHighlight === 0)
      {
        return;
      }

      for (var i = 0; i < nextRowsToHighlight; ++i)
      {
        rowEl = rowEl.nextElementSibling;
        rowEl.classList.toggle('is-hovered');
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

        if (rowEl.classList.contains('pos-details-item'))
        {
          break;
        }
      }

      rowEl = e.currentTarget;

      while (true)
      {
        rowEl = rowEl.nextElementSibling;

        if (rowEl === null || rowEl.classList.contains('pos-details-item'))
        {
          break;
        }

        rowEl.classList.toggle('is-hovered');
      }
    },

    onKeyDown: function(e)
    {
      if (e.keyCode === 27)
      {
        this.$('.action-print.active').click().focus();
      }
    },

    onResize: function()
    {
      this.positionPrintDialog();
    },

    onPrintActionClick: function(e)
    {
      if (this.printing)
      {
        return false;
      }

      var el = e.currentTarget;

      var $activePrintAction = this.$('.action-print.active');

      if ($activePrintAction[0] !== el)
      {
        $activePrintAction.removeClass('active');
      }

      el.classList.toggle('active');

      if (el.classList.contains('active'))
      {
        this.showPrintDialog(el);
      }
      else
      {
        this.$printDialog.stop().fadeOut('fast');
      }
    },

    showPrintDialog: function(printActionEl)
    {
      var $printAction = this.$(printActionEl);

      this.$printDialog.insertAfter($printAction);

      this.positionPrintDialog();
      this.restorePrintButtonState();

      this.$id('shippingNo').val('');
      this.$id('packages').val('1');
      this.$id('components').val(this.model.getFirstScheduledQuantity(printActionEl.dataset.item));
      this.$id('remainder').val('0');

      this.$printDialog
        .attr('action', '/purchaseOrders/' + printActionEl.dataset.order + '/' + printActionEl.dataset.item + ';print')
        .stop()
        .fadeIn('fast')
        .find('input')
        .first()
        .focus();

      this.$id('pdfPreview').prop('src', 'about:blank');
    },

    positionPrintDialog: function()
    {
      this.$printDialog.css('top', this.$printDialog.parent().outerHeight() - 1);
    },

    onPrintDialogSubmit: function()
    {
      this.printing = true;

      var url = this.$printDialog.attr('action') + '?' + this.$printDialog.serialize();

      var $print = this.$id('print');

      $print
        .removeClass('btn-primary btn-danger btn-success')
        .addClass('btn-warning')
        .find('.fa')
        .removeClass('fa-print')
        .addClass('fa-spinner fa-spin');

      var $fields = this.$printDialog.find('input, button').attr('disabled', true);

      var req = this.ajax({
        method: 'POST',
        url: url,
        dataType: 'text',
        contentType: 'text/plain'
      });

      var view = this;
      var restorePrintButtonState = this.restorePrintButtonState.bind(this);

      req.fail(function(jqXhr)
      {
        $print
          .removeClass('btn-warning')
          .addClass('btn-danger')
          .find('.fa')
          .removeClass('fa-spinner fa-spin')
          .addClass('fa-print');

        console.error(jqXhr.responseText);
      });

      req.done(function()
      {
        $print
          .removeClass('btn-warning')
          .addClass('btn-success')
          .find('.fa')
          .removeClass('fa-spinner fa-spin')
          .addClass('fa-print');

        view.printPdf(url);
      });

      req.always(function()
      {
        $fields.filter(':not(button.btn)').attr('disabled', false);
        $fields.first().focus();

        view.timers.restorePrintButtonState = setTimeout(restorePrintButtonState, 2500);
        view.printing = false;
      });

      return false;
    },

    restorePrintButtonState: function()
    {
      clearTimeout(this.timers.restorePrintButtonState);

      this.$id('print')
        .removeClass('btn-warning btn-danger btn-success')
        .addClass('btn-primary')
        .attr('disabled', false)
        .find('.fa')
        .removeClass('fa-spinner fa-spin')
        .addClass('fa-print');
    },

    printPdf: function(url)
    {
      this.$id('pdfPreview').prop('src', url);
    },

    onPdfPreviewLoad: function()
    {
      var pdfPreviewEl = this.$id('pdfPreview')[0];

      if (pdfPreviewEl.src !== 'about:blank')
      {
        pdfPreviewEl.contentWindow.focus();
        pdfPreviewEl.contentWindow.print();
      }
    },

    onItemStatusFilterChange: function(e)
    {
      var selector = e.currentTarget.value === 'closed' ? '.is-completed' : '.is-waiting';
      var state = e.currentTarget.checked;

      this.$(selector).toggle(state);
    },

    showAllChanges: function()
    {
      this.$('.pos-details-changes-more').remove();
      this.$('.pos-details-changes .hidden').removeClass('hidden');
    }

  });
});
