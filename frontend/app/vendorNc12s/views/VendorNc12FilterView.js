// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/user',
  'app/core/views/FilterView',
  'app/vendors/util/setUpVendorSelect2',
  'app/vendorNc12s/templates/filter'
], function(
  user,
  FilterView,
  setUpVendorSelect2,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      vendor: '',
      nc12: ''
    },

    termToForm: {
      'nc12': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData.nc12 = term.args[1].replace('^', '');
        }
        else if (term.name === 'eq')
        {
          formData.nc12 = term.args[1];
        }
      },
      'vendor': function(propertyName, term, formData)
      {
        formData.vendor = term.args[1];
      }
    },

    serializeFormToQuery: function(selector)
    {
      var vendor = this.$id('vendor').val();
      var nc12 = this.$id('nc12').val().trim().replace(/[^0-9]/g, '');

      if (vendor)
      {
        selector.push({name: 'eq', args: ['vendor', vendor]});
      }

      if (nc12.length === 12)
      {
        selector.push({name: 'eq', args: ['nc12', nc12]});
      }
      else if (nc12.length)
      {
        selector.push({name: 'regex', args: ['nc12', '^' + nc12]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      if (!user.data.vendor)
      {
        var vendor = this.$id('vendor').val();

        if (vendor)
        {
          vendor = {id: vendor, text: vendor};
        }

        setUpVendorSelect2(this.$id('vendor'), {width: 250}).select2('data', vendor);
      }
    }

  });
});
