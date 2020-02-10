// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/templates/colorPicker',
  'app/wmes-trw-programs/templates/messageForm',
  'bootstrap-colorpicker'
], function(
  _,
  $,
  viewport,
  FormView,
  colorPickerTemplate,
  template
) {
  'use strict';

  return FormView.extend({

    nlsDomain: 'wmes-trw-programs',

    template: template,

    updateOnChange: false,

    events: _.assign({
      'change [name$=Color]': 'updateColorPicker'
    }, FormView.prototype.events),

    destroy: function()
    {
      this.$('.colorpicker-component').colorpicker('destroy');
    },

    getTemplateData: function()
    {
      return _.assign(FormView.prototype.getTemplateData.call(this), {
        renderColorPicker: colorPickerTemplate
      });
    },

    afterRender: function()
    {
      var view = this;

      FormView.prototype.afterRender.apply(view, arguments);

      var $modal = $('.modal');

      view.$('input[name$="Color"]').each(function()
      {
        view.$(this).parent().colorpicker({
          container: $modal
        });
      });
    },

    onDialogShown: function()
    {
      this.$id('steps').focus();
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.steps = formData.steps.join(', ');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.text = (formData.text || '').trim().replace(/ {2,}/g, ' ');

      formData.steps = (formData.steps || '')
        .split(/[^0-9]+/)
        .filter(function(n) { return !!n; })
        .map(function(n) { return +n; });

      ['top', 'left', 'width', 'height', 'fontSize', 'borderWidth'].forEach(function(prop)
      {
        var n = parseInt(formData[prop], 10);

        formData[prop] = isNaN(n) ? null : n;
      });

      ['fontColor', 'bgColor', 'borderColor'].forEach(function(prop)
      {
        formData[prop] = /^#[0-9a-fA-F]{6}$/.test(formData[prop]) ? formData[prop].toUpperCase() : null;
      });

      return formData;
    },

    submitRequest: function($submit, formData)
    {
      this.model.set(formData);

      viewport.closeDialog();
    },

    updateColorPicker: function(e)
    {
      if (e.originalEvent)
      {
        this.$(e.target).closest('.colorpicker-component').colorpicker('setValue', e.target.value);
      }
    }

  });
});
