// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'form2js',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/purchaseOrders/templates/printDialog',
  '../labelConfigurations'
], function(
  js2form,
  form2js,
  t,
  viewport,
  View,
  template,
  labelConfigurations
) {
  'use strict';

  return View.extend({

    dialogClassName: 'pos-printDialog',

    template: template,

    events: {
      'focus .form-control': 'toggleRowFocus',
      'blur .form-control': 'toggleRowFocus',
      'change .pos-printDialog-qty': 'recountTotals',
      'keyup .pos-printDialog-qty': 'recountTotals',
      'blur .pos-printDialog-qty': function(e)
      {
        var qty = this.parseQty(e.target.value, e.target.dataset.integer !== undefined);

        e.target.value = Math.min(e.target.max, qty).toLocaleString();
      },
      'submit': 'submitForm'
    },

    initialize: function()
    {
      this.decimalSeparator = (1.1).toLocaleString().substr(1, 1);
      this.$msg = null;
    },

    destroy: function()
    {
      this.hideMessage();
    },

    getTemplateData: function()
    {
      return {
        action: '/purchaseOrders/' + this.model.get('orderId') + '/prints',
        printers: this.options.printers,
        barcodes: labelConfigurations.getBarcodes(),
        paperGroups: labelConfigurations.getPaperGroups(),
        items: this.model.get('items').map(function(item)
        {
          return {
            _id: item._id,
            nc12: item.nc12
          };
        })
      };
    },

    afterRender: function()
    {
      js2form(this.el, this.model.toJSON());

      this.recountTotals();
    },

    hideMessage: function()
    {
      if (this.$msg !== null)
      {
        viewport.msg.hide(this.$msg);
        this.$msg = null;
      }
    },

    toggleRowFocus: function(e)
    {
      e.currentTarget.parentNode.parentNode.classList.toggle('is-focused');
    },

    recountTotals: function()
    {
      var overallPackageQty = 0;
      var overallComponentQty = 0;
      var overallRemainingQty = 0;
      var overallTotalPackageQty = 0;
      var overallTotalQty = 0;
      var view = this;

      this.$('.pos-printDialog-items-item').each(function()
      {
        var rowEl = this;
        var inputs = rowEl.querySelectorAll('.pos-printDialog-qty');
        var packageQty = view.parseQty(inputs[0].value);
        var componentQty = view.parseQty(inputs[1].value);
        var remainingQty = view.parseQty(inputs[2].value);

        if (packageQty === 0)
        {
          componentQty = 0;
        }

        if (componentQty === 0)
        {
          packageQty = 0;
        }

        var totalPackageQty = packageQty + (remainingQty > 0 ? 1 : 0);
        var totalQty = packageQty * componentQty + remainingQty;

        overallPackageQty += packageQty;
        overallComponentQty += componentQty;
        overallRemainingQty += remainingQty;
        overallTotalPackageQty += totalPackageQty;
        overallTotalQty += totalQty;

        rowEl.querySelector('.pos-printDialog-items-totalPackageQty').textContent = totalPackageQty.toLocaleString();
        rowEl.querySelector('.pos-printDialog-items-totalQty').textContent = totalQty.toLocaleString();
      });

      this.$id('overallPackageQty').text(overallPackageQty.toLocaleString());
      this.$id('overallComponentQty').text(overallComponentQty.toLocaleString());
      this.$id('overallRemainingQty').text(overallRemainingQty.toLocaleString());
      this.$id('overallTotalPackageQty').text(overallTotalPackageQty.toLocaleString());
      this.$id('overallTotalQty').text(overallTotalQty.toLocaleString());
    },

    submitForm: function()
    {
      this.hideMessage();

      var formData = this.serializeFormData();

      var req = this.ajax({
        type: 'POST',
        url: this.el.action,
        data: JSON.stringify(formData)
      });

      var $fields = this.$('input, button, select').attr('disabled', true);
      var $submitIcon = $fields
        .filter('.btn-primary')
        .find('.fa')
        .removeClass('fa-print')
        .addClass('fa-spin fa-spinner');
      var view = this;

      req.fail(function(res, result)
      {
        if (result === 'abort')
        {
          return;
        }

        var error = res.responseJSON.error.message;

        view.$msg = viewport.msg.show({
          type: 'error',
          time: 8000,
          text: t.has('purchaseOrders', 'printDialog:msg:' + error)
            ? t('purchaseOrders', 'printDialog:msg:' + error)
            : t('purchaseOrders', 'printDialog:msg:failure')
        });
      });

      req.done(function(res)
      {
        view.model.set({
          _id: res.printKey,
          shippingNo: formData.shippingNo,
          printer: formData.printer,
          paper: formData.paper,
          barcode: formData.barcode
        });

        localStorage.setItem('POS:PAPER', formData.paper);
        localStorage.setItem('POS:BARCODE', formData.barcode);

        view.trigger('print', res.prints);
      });

      req.always(function()
      {
        $submitIcon.removeClass('fa-spin fa-spinner').addClass('fa-print');
        $fields.attr('disabled', false);
      });

      return false;
    },

    serializeFormData: function()
    {
      var formData = form2js(this.el);

      formData.items = formData.items
        .map(function(item)
        {
          item.packageQty = this.parseQty(item.packageQty);
          item.componentQty = this.parseQty(item.componentQty);
          item.remainingQty = this.parseQty(item.remainingQty);

          var totalQty = item.packageQty * item.componentQty + item.remainingQty;

          if (totalQty === 0)
          {
            return null;
          }

          return item;
        }, this)
        .filter(function(item) { return item !== null; });

      return formData;
    },

    parseQty: function(value, noDecimals)
    {
      var parts = String(value).split(this.decimalSeparator);
      var integer = parseInt(parts[0].replace(/[^0-9]+/g, ''), 10);
      var decimals = parts.length > 1 ? parseInt(parts[1].replace(/[^0-9]+/g, ''), 10) : 0;

      integer = isNaN(integer) ? '0' : integer.toString();
      decimals = isNaN(decimals) ? '0' : decimals.toString();

      if (noDecimals || decimals === '0')
      {
        return integer === '0' ? 0 : parseInt(integer, 10);
      }

      return parseFloat(integer + '.' + decimals.substr(0, 3));
    }

  });
});
