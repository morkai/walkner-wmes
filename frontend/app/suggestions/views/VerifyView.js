// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/verify'
], function(
  _,
  time,
  user,
  viewport,
  FormView,
  setUpUserSelect2,
  kaizenDictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'click #-accept': function()
      {
        this.status = 'finished';

        if (this.el.reportValidity())
        {
          this.submitForm();
        }
      },

      'click #-reject': function()
      {
        this.status = 'inProgress';

        this.submitForm();
      },

      'click #-cancel': function()
      {
        this.status = 'cancelled';

        this.submitForm();
      }

    }, FormView.prototype.events),

    serializeToForm: function()
    {
      return {

      };
    },

    serializeForm: function(formData)
    {
      return {
        status: this.status,
        comment: formData.comment
      };
    },

    request: function(formData)
    {
      return this.ajax({
        method: 'PUT',
        url: this.model.url(),
        data: JSON.stringify(formData)
      });
    },

    getFailureText: function()
    {
      return this.t('verify:failure');
    },

    handleSuccess: function()
    {
      viewport.closeDialog();
    }

  });
});
