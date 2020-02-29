// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/data/aors',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/core/templates/colorPicker',
  '../DowntimeReason',
  'app/downtimeReasons/templates/form',
  'bootstrap-colorpicker'
], function(
  _,
  t,
  aors,
  FormView,
  idAndLabel,
  colorPickerTemplate,
  DowntimeReason,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.assign({}, FormView.prototype.events, {
      'change #-color': 'updateColorPicker',
      'change #-refColor': 'updateColorPicker'
    }),

    destroy: function()
    {
      FormView.prototype.destroy.call(this);

      this.$('.colorpicker-component').colorpicker('destroy');
    },

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {
        renderColorPicker: colorPickerTemplate,
        SUBDIVISION_TYPES: DowntimeReason.SUBDIVISION_TYPES
      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('color').parent().colorpicker();
      this.$id('refColor').parent().colorpicker();

      if (this.options.editMode)
      {
        this.$('.form-control[name=_id]').attr('readonly', true);
        this.$('.form-control[name=label]').focus();
      }

      this.$id('aors').select2({
        placeholder: t('downtimeReasons', 'aors:all'),
        multiple: true,
        data: aors.map(idAndLabel)
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.scheduled = String(formData.scheduled);
      formData.aors = formData.aors.join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      var refValue = parseFloat(formData.refValue);

      formData.refValue = isNaN(refValue) ? 0 : refValue;

      if (formData.scheduled === 'null')
      {
        formData.scheduled = null;
      }

      formData.aors = formData.aors ? formData.aors.split(',') : [];

      return formData;
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
