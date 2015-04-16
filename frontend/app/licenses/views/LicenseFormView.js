// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

      return formData;
    },

    serializeForm: function(formData)
    {
      formData._id = !formData._id || _.isEmpty(formData._id.trim()) ? null : formData._id;
      formData.appVersion = _.isEmpty(formData.appVersion) ? '*' : formData.appVersion;
      formData.date = _.isEmpty(formData.date) ? null : formData.date;

      return formData;
    }

  });
});
