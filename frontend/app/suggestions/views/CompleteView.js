// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/complete'
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
        this.status = 'verification';

        if (this.el.reportValidity())
        {
          this.submitForm();
        }
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
        kaizenImprovements: this.model.get('kaizenImprovements') || '',
        kaizenEffect: this.model.get('kaizenEffect') || ''
      };
    },

    serializeForm: function(formData)
    {
      formData.status = this.status;

      if (this.status === 'verification')
      {
        formData.kaizenFinishDate = time.getMoment().startOf('day').toISOString();
      }
      else
      {
        formData.kaizenFinishDate = null;
        formData.kaizenImprovements = '';
        formData.kaizenEffect = '';
      }

      return formData;
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
      return this.t('complete:failure');
    },

    handleSuccess: function()
    {
      viewport.closeDialog();
    }

  });
});
