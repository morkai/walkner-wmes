// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
