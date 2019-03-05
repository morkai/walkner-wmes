// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'js2form',
  'form2js',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/parseNumber',
  'app/purchaseOrders/templates/vendorPrintDialog',
  '../labelConfigurations'
], function(
  _,
  js2form,
  form2js,
  t,
  viewport,
  View,
  parseNumber,
  template,
  labelConfigurations
) {
  'use strict';

  return View.extend({

    dialogClassName: 'pos-vendorPrintDialog',

    template: template,

    events: {
      'focus .form-control': 'toggleRowFocus',
      'blur .form-control': 'toggleRowFocus',
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
    },

    getTemplateData: function()
    {
      return {
        printers: this.options.printers,
        labelTypes: labelConfigurations.getVendorLabelTypes(),
        items: this.model
      };
    },

    afterRender: function()
    {
      js2form(this.el, {items: this.model});
    },

    toggleRowFocus: function(e)
    {
      e.currentTarget.parentNode.parentNode.classList.toggle('is-focused');
    },

    submitForm: function()
    {
      this.trigger('print', this.serializeFormData());

      return false;
    },

    serializeFormData: function()
    {
      var formData = form2js(this.el);

      formData.items = formData.items.filter(function(item)
      {
        item.labelCount = this.parseQty(item.labelCount);
        item.value = _.isString(item.value) ? item.value.trim() : '';
        item.unit = _.isString(item.unit) ? item.unit.trim() : '';

        return item.labelCount > 0 && !_.isEmpty(item.value);
      }, this);

      return formData;
    },

    parseQty: function(value, noDecimals)
    {
      return parseNumber(value, noDecimals);
    }

  });
});
