// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/views/FormView',
  '../XiconfHidLamp',
  'app/xiconfHidLamps/templates/form'
], function(
  $,
  _,
  t,
  time,
  FormView,
  XiconfHidLamp,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);


    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.family = formData.family.join('; ');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.voltage = formData.voltage || '';
      formData.family = (formData.family || '')
        .split(/(?:\s+|,|;)/)
        .map(function(d) { return d.trim(); })
        .filter(function(d) { return !!d.length; });

      return formData;
    }

  });
});
