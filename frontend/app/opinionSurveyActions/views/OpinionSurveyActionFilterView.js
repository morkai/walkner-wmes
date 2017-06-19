// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/opinionSurveys/dictionaries',
  'app/opinionSurveyActions/templates/filter'
], function(
  t,
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
        status: '',
        participants: ''
      };
    },

    termToForm: {
      'survey': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'division': 'survey',
      'status': 'survey',
      'participants': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1].join(',') : term.args[1];
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

      this.$id('division').select2({
        width: 150,
        allowClear: true,
        data: dictionaries.divisions.map(idAndLabel)
      });

      this.$id('status').select2({
        width: 200,
        allowClear: true,
        placeholder: ' ',
        minimumResultsForSearch: -1,
        data: dictionaries.actionStatuses.map(function(status)
        {
          return {
            id: status,
            text: t('opinionSurveyActions', 'status:' + status)
          };
        })
      });

      setUpUserSelect2(this.$id('participants'), {
        width: 300,
        view: this
      });
    },

    serializeFormToQuery: function(selector)
    {
      ['survey', 'division', 'status', 'participants'].forEach(function(prop)
      {
        var value = this.$id(prop).val();

        if (value.length)
        {
          selector.push({name: 'eq', args: [prop, value]});
        }
      }, this);
    }

  });
});
