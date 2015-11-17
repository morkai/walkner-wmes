// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/kaizenProductFamilies/templates/form'
], function(
  _,
  FormView,
  setUpUserSelect2,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.owners = _.isEmpty(formData.owners) ? '' : formData.owners.map(function(o) { return o.id; }).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.owners = (this.$id('owners').select2('data') || []).map(function(o)
      {
        return {
          id: o.id,
          label: o.text
        };
      });

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$id('id').prop('readonly', true);
        this.$id('name').focus();
      }

      setUpUserSelect2(this.$id('owners'), {
        view: this,
        multiple: true
      });
    }

  });
});
