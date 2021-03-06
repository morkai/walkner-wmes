// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/views/FormView',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/planning-orderGroups/templates/form'
], function(
  _,
  $,
  FormView,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.mrp = (formData.mrp || []).join(',');

      ['productInclude', 'productExclude', 'bomInclude', 'bomExclude'].forEach(prop =>
      {
        formData[prop] = (formData[prop] || [])
          .map(words => words.join('; '))
          .join('\n');
      });

      return formData;
    },

    serializeForm: function(formData)
    {
      if (!formData.description)
      {
        formData.description = '';
      }

      formData.mrp = (formData.mrp || '').split(',').filter(function(v) { return !!v; });

      ['productInclude', 'productExclude', 'bomInclude', 'bomExclude'].forEach(function(prop)
      {
        formData[prop] = _.uniq((formData[prop] || '')
          .split('\n'))
          .map(line =>
          {
            return _.uniq(line.split(/; */)
              .map(word => word.trim().replace(/\s+/g, ' ').toUpperCase())
              .filter(word => word.length > 0));
          })
          .filter(words => words.length > 0);
      });

      if (!formData.target)
      {
        formData.target = [];
      }

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      setUpMrpSelect2(this.$id('mrp'), {
        width: '100%'
      });

      if (this.model.id === '000000000000000000000000')
      {
        this.$id('mrp').select2('enable', false);
        this.$('textarea.text-mono').prop('disabled', true);
      }
    }

  });
});
