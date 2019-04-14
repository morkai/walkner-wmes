// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FormView',
  '../Program',
  'app/wmes-snf-programs/templates/form'
], function(
  _,
  time,
  FormView,
  Program,
  formTemplate
) {
  'use strict';

  var TIME_PROPERTIES = [
    'waitForStartTime',
    'illuminationTime',
    'hrsInterval',
    'hrsTime'
  ];

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'programForm',

    events: {
      'submit': 'submitForm',
      'blur .programs-form-time': function(e)
      {
        e.target.value = time.toString(time.toSeconds(e.target.value));
      },
      'change [name=kind]': 'onKindChange'
    },

    destroy: function()
    {
      this.$id('kind').select2('destroy');
      this.$id('lightSourceType').select2('destroy');
      this.$id('bulbPower').select2('destroy');
      this.$id('ballast').select2('destroy');
      this.$id('ignitron').select2('destroy');
    },

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), Program.OPTIONS);
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      TIME_PROPERTIES.forEach(function(timeProperty)
      {
        console.log(timeProperty, formData[timeProperty], time.toString(formData[timeProperty]));
        formData[timeProperty] = time.toString(formData[timeProperty]);
      });

      return formData;
    },

    serializeForm: function(formData)
    {
      TIME_PROPERTIES.forEach(function(timeProperty)
      {
        formData[timeProperty] = time.toSeconds(formData[timeProperty]);
      });

      Program.OPTIONS.contactors.forEach(function(contactor)
      {
        formData[contactor] = !!formData[contactor];
      });

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('kind').select2();
      this.$id('lightSourceType').select2();
      this.$id('bulbPower').select2();
      this.$id('ballast').select2();
      this.$id('ignitron').select2();

      this.onKindChange({val: this.$id('kind').val()});
    },

    onKindChange: function(e)
    {
      var is30s = e.val === '30s';
      var isTester = e.val === 'tester';

      this.$id('illuminationTime')
        .val(isTester ? '0s' : is30s ? '30s' : this.$id('illuminationTime').val())
        .attr('readonly', is30s || isTester);
      this.$id('waitForStartTime').attr('disabled', isTester);
      this.$id('hrs').find('input').attr('readonly', is30s || isTester);
      this.$id('lightSourceType').select2('readonly', isTester);
      this.$id('bulbPower').select2('readonly', isTester);
      this.$id('ballast').select2('readonly', isTester);
      this.$id('ignitron').select2('readonly', isTester);
    }

  });
});
