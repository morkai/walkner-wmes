// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/opinionSurveys/dictionaries',
  'app/opinionSurveyScanTemplates/templates/filter'
], function(
  FilterView,
  idAndLabel,
  dictionaries,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: function()
    {
      return {
        survey: ''
      };
    },

    termToForm: {
      'survey': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('survey').select2({
        width: 175,
        allowClear: true,
        placeholder: ' ',
        minimumResultsForSearch: -1,
        data: this.model.opinionSurveys.map(idAndLabel)
      });
    },

    serializeFormToQuery: function(selector)
    {
      var survey = this.$id('survey').val();

      if (survey.length)
      {
        selector.push({name: 'eq', args: ['survey', survey]});
      }
    }

  });
});
