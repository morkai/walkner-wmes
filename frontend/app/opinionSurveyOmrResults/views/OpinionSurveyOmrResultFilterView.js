// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/opinionSurveys/dictionaries',
  'app/opinionSurveyOmrResults/templates/filter'
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
        status: '',
        survey: ''
      };
    },

    termToForm: {
      'status': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'survey': 'status'
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
      var status = this.$id('status').val();
      var survey = this.$id('survey').val();

      if (status.length)
      {
        selector.push({name: 'eq', args: ['status', status]});
      }

      if (survey.length)
      {
        selector.push({name: 'eq', args: ['survey', survey]});
      }
    }

  });
});
