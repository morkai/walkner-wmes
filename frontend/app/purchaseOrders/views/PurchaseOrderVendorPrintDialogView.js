// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'js2form',
  'form2js',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/purchaseOrders/templates/vendorPrintDialog',
  '../labelConfigurations'
], function(
  _,
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

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
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
