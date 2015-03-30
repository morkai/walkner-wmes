// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/user',
  'app/core/views/FormView',
  'app/vendors/util/setUpVendorSelect2',
  'app/vendorNc12s/templates/form'
], function(
  _,
  user,
  FormView,
  setUpVendorSelect2,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.extend(FormView.prototype.events, {
      'change #-nc12': function()
      {
        var $nc12 = this.$id('nc12');

        $nc12.val($nc12.val().replace(/[^0-9]/g, ''));
      }
    }),

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$id('nc12').attr('readonly', true);
      }

      if (!user.vendor)
      {
        setUpVendorSelect2(this.$id('vendor'));
      }
    },

    serializeForm: function(formData)
    {
      if (_.isEmpty(formData.value))
      {
        formData.value = '';
      }

      if (_.isEmpty(formData.unit))
      {
        formData.unit = '';
      }

      return formData;
    }

  });
});
