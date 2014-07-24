// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/views/FilterView',
  'app/purchaseOrders/templates/filter'
], function(
  FilterView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      _id: '',
      nc12: '',
      from: '',
      to: ''
    },

    termToForm: {
      '_id': function(propertyName, term, formData)
      {
        formData._id = typeof term.args[1] === 'string' ? term.args[1].replace(/^[0-9]/g, '') : '';
      },
      'items.nc12': '_id'
    },

    serializeTermToForm: function(selector)
    {
      this.serializeRegexTerm(selector, '_id', 6);
      this.serializeRegexTerm(selector, 'items.nc12', 12);
    }

  });
});
