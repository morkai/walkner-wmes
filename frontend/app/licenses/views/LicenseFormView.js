// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FormView',
  'app/licenses/templates/form'
], function(
  _,
  time,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.date = time.format(formData.date, 'YYYY-MM-DD');
      formData.expireDate = _.isEmpty(formData.expireDate) ? '' : time.format(formData.expireDate, 'YYYY-MM-DD');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData._id = !formData._id || _.isEmpty(formData._id.trim()) ? null : formData._id;
      formData.appVersion = _.isEmpty(formData.appVersion) ? '*' : formData.appVersion;
      formData.date = _.isEmpty(formData.date) ? null : formData.date;

      var expireDate = time.getMoment(formData.expireDate, 'YYYY-MM-DD');

      formData.expireDate = expireDate.isValid() ? expireDate.toISOString() : null;

      return formData;
    }

  });
});
