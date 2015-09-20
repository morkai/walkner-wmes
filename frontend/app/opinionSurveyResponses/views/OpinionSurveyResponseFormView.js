// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/opinionSurveyResponses/templates/form',
  'app/opinionSurveyResponses/templates/formAnswer'
], function(
  _,
  FormView,
  idAndLabel,
  template,
  renderAnswer
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.extend({

      'change #-survey': function(e)
      {
        this.selectSurvey(e.added.id);
      }

    }, FormView.prototype.events),

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('survey').select2({
        minimumResultsForSearch: 5,
        data: this.model.surveys.map(idAndLabel)
      });

      if (this.options.editMode)
      {
        this.selectSurvey(this.model.get('survey')._id);
        this.$id('comment').focus();
      }
      else if (this.model.surveys.length)
      {
        this.selectSurvey(this.model.surveys.at(0).id);
        this.$id(this.model.surveys.length === 1 ? 'comment' : 'survey').focus();
      }
      else
      {
        this.setUpEmployerSelect2([]);
        this.setUpSuperiorSelect2([]);
        this.$id('survey').focus();
      }
    },

    setUpEmployerSelect2: function(employers)
    {
      this.$id('employer').select2({
        minimumResultsForSearch: 5,
        data: employers.map(function(employer)
        {
          return {
            id: employer._id,
            text: employer.full
          };
        })
      });
    },

    setUpSuperiorSelect2: function(superiors)
    {
      this.$id('superior').select2({
        minimumResultsForSearch: 5,
        data: superiors.map(function(superior)
        {
          return {
            id: superior._id,
            text: superior.full + ' (' + superior.division + ')',
            division: superior.division
          };
        })
      });
    },

    selectSurvey: function(surveyId)
    {
      var survey = this.model.surveys.get(surveyId);

      if (!survey)
      {
        return;
      }

      this.setUpEmployerSelect2(survey.get('employers'));
      this.setUpSuperiorSelect2(survey.get('superiors'));

      var idPrefix = this.idPrefix;
      var answers = this.model.get('answers') || [];
      var answersHtml = survey.get('questions').map(function(question, i)
      {
        return renderAnswer({
          idPrefix: idPrefix,
          index: i,
          question: question,
          value: answers[i] ? answers[i].answer : 'na'
        });
      });

      this.$id('survey').select2('val', surveyId);
      this.$id('answers').html(answersHtml.join(''));
    },

    serializeForm: function(formData)
    {
      formData.division = this.$id('superior').select2('data').division;

      return formData;
    }

  });
});
