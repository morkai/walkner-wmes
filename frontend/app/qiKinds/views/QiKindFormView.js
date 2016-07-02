// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/qiKinds/templates/form'
], function(
  t,
  FormView,
  idAndLabel,
  orgUnits,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('division').select2({
        allowClear: true,
        placeholder: t('qiKinds', 'ordersDivision'),
        data: orgUnits.getAllByType('division').map(idAndLabel)
      });
    },

    serializeForm: function(formData)
    {
      formData.division = formData.division || null;

      return formData;
    }

  });
});
