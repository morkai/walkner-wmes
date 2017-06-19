// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/opinionSurveys/dictionaries',
  'app/opinionSurveyResponses/templates/filter'
], function(
  time,
  FilterView,
  idAndLabel,
  setUpUserSelect2,
  dictionaries,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: function()
    {
      return {
        survey: '',
        division: '',
        superior: '',
        employer: ''
      };
    },

    termToForm: {
      'survey': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'division': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1].join(',') : term.args[1];
      },
      'superior': 'division',
      'employer': 'division'
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

      this.$id('division').select2({
        width: 225,
        multiple: true,
        allowClear: true,
        data: dictionaries.divisions.map(idAndLabel)
      });

      this.$id('employer').select2({
        width: 200,
        multiple: true,
        allowClear: true,
        data: dictionaries.employers.map(idAndLabel)
      });

      setUpUserSelect2(this.$id('superior'), {
        width: 500,
        multiple: true,
        view: this
      });
    },

    serializeFormToQuery: function(selector)
    {
      var survey = this.$id('survey').val();

      if (survey.length)
      {
        selector.push({name: 'eq', args: ['survey', survey]});
      }

      ['division', 'employer', 'superior'].forEach(function(prop)
      {
        var values = this.$id(prop).val().split(',');

        if (values.length > 1)
        {
          selector.push({name: 'in', args: [prop, values]});
        }
        else if (values[0] !== '')
        {
          selector.push({name: 'eq', args: [prop, values[0]]});
        }
      }, this);
    }

  });
});
