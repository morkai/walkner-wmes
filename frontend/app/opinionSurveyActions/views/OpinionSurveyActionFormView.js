// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/opinionSurveys/dictionaries',
  'app/opinionSurveys/util/formatQuestionResult',
  'app/opinionSurveyActions/templates/form'
], function(
  _,
  t,
  time,
  user,
  FormView,
  idAndLabel,
  setUpUserSelect2,
  dictionaries,
  formatQuestionResult,
  template
) {
  'use strict';

  function userOptionToInfo(userOption)
  {
    return {
      id: userOption.id,
      label: userOption.text.replace(/\s*\(.*?\)$/, '')
    };
  }

  return FormView.extend({

    template: template,

    events: _.assign({

      'change #-survey': function(e)
      {
        this.selectSurvey(e.added.id);
      },

      'change #-division': function(e)
      {
        this.selectDivision(e.added.id);
      },

      'change #-questionList': function(e)
      {
        if (e.added)
        {
          this.$id('question').val(e.added.full).focus();
        }
      }

    }, FormView.prototype.events),

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.owners = formData.owners ? formData.owners.map(function(owner) { return owner.id; }).join(',') : '';
      formData.superior = formData.superior ? formData.superior.id : '';
      formData.startDate = formData.startDate ? time.format(formData.startDate, 'YYYY-MM-DD') : '';
      formData.endDate = formData.endDate ? time.format(formData.endDate, 'YYYY-MM-DD') : '';

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.superior = userOptionToInfo(this.$id('superior').select2('data'));
      formData.owners = this.$id('owners').select2('data').map(userOptionToInfo);
      formData.startDate = formData.startDate ? time.getMoment(formData.startDate, 'YYYY-MM-DD').toISOString() : '';
      formData.endDate = formData.endDate ? time.getMoment(formData.endDate, 'YYYY-MM-DD').toISOString() : '';

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('survey').select2({
        minimumResultsForSearch: 5,
        data: this.model.surveys.map(idAndLabel)
      });

      setUpUserSelect2(this.$id('superior'), {
        view: this,
        textFormatter: function(user, name, query)
        {
          if (user.personnelId && query && /^[0-9]+$/.test(query.term))
          {
            name += ' (' + user.personnelId + ')';
          }
          else if (user.orgUnitType === 'division')
          {
            name += ' (' + user.orgUnitId + ')';
          }

          return name;
        }
      });

      this.$id('status').select2({
        minimumResultsForSearch: -1,
        data: dictionaries.actionStatuses.map(function(status)
        {
          return {
            id: status,
            text: t('opinionSurveyActions', 'status:' + status)
          };
        })
      });

      if (this.options.editMode)
      {
        this.selectSurvey(this.model.get('survey')._id);
        this.$id('problem').focus();
      }
      else if (this.model.surveys.length)
      {
        this.selectSurvey(this.model.surveys.at(0).id);

        var userDivision = user.getDivision();

        if (userDivision)
        {
          this.selectDivision(userDivision.id);
        }

        this.$id(this.model.surveys.length === 1 ? 'division' : 'survey').focus();
      }
      else
      {
        this.setUpDivisionSelect2([]);
        this.setUpOwnersSelect2([]);
        this.setUpQuestionSelect2([]);
        this.$id('survey').focus();
      }
    },

    setUpDivisionSelect2: function(divisions)
    {
      this.$id('division').select2({
        minimumResultsForSearch: 2,
        data: divisions.map(function(divisionId)
        {
          var division = dictionaries.divisions.get(divisionId);

          return {
            id: division.id,
            text: division.get('full') + ' (' + division.get('short') + ')'
          };
        })
      });
    },

    setUpOwnersSelect2: function(owners)
    {
      this.$id('owners').select2({
        minimumResultsForSearch: 7,
        multiple: true,
        data: owners.map(function(owner)
        {
          return {
            id: owner._id,
            text: owner.full + ' (' + owner.division + ')',
            division: owner.division
          };
        })
      });
    },

    setUpQuestionSelect2: function(questions)
    {
      this.$id('questionList').select2({
        minimumResultsForSearch: -1,
        formatResult: formatQuestionResult,
        data: questions.map(function(question)
        {
          return {
            id: question._id,
            text: question.short,
            short: question.short,
            full: question.full
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

      this.setUpDivisionSelect2(Object.keys(survey.cacheMaps.divisions));
      this.setUpOwnersSelect2(survey.get('superiors'));
      this.setUpQuestionSelect2(survey.get('questions'));

      this.$id('survey').select2('val', survey.id);
    },

    selectDivision: function(divisionId)
    {
      var survey = this.model.surveys.get(this.$id('survey').val());
      var owners = survey.cacheMaps.divisions[divisionId].map(function(owner) { return owner._id; });

      this.$id('owners').select2('val', owners);

      var view = this;
      var req = this.ajax({
        url: '/users?select(firstName,lastName)&prodFunction=manager&orgUnitId=' + divisionId
      });

      req.done(function(res)
      {
        if (!res || !res.totalCount)
        {
          return;
        }

        var superior = res.collection[0];

        view.$id('superior').select2('data', {
          id: superior._id,
          text: superior.lastName + ' ' + superior.firstName + ' (' + divisionId + ')'
        });
      });

      this.$id('division').select2('val', divisionId);
    }

  });
});
