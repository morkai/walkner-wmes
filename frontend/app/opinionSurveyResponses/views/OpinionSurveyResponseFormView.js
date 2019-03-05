// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'dragscroll',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/opinionSurveyResponses/templates/form',
  'app/opinionSurveyResponses/templates/formAnswer'
], function(
  _,
  dragscroll,
  FormView,
  idAndLabel,
  template,
  renderAnswer
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'change #-survey': function(e)
      {
        this.selectSurvey(e.added.id);
      },

      'click .nav-tabs a': function(e)
      {
        e.preventDefault();

        this.$(e.target).tab('show');
      }

    }, FormView.prototype.events),

    destroy: function()
    {
      FormView.prototype.destroy.call(this);

      dragscroll.destroy();
    },

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {
        omrResults: (this.model.omrResults || []).map(function(omrResult)
        {
          return {
            _id: omrResult.get('_id'),
            pageNumber: omrResult.get('pageNumber')
          };
        })
      });
    },

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

      if (this.options.fixing)
      {
        this.$('[type="submit"]').click();
      }

      if (this.model.omrResults && this.model.omrResults.length)
      {
        this.activatePreviewTab(this.model.omrResults.at(0).id);
        this.resizePreview();

        dragscroll.reset();
      }
    },

    activatePreviewTab: function(tab)
    {
      this.$('.nav-tabs > li[data-tab="' + tab + '"] > a').tab('show');
    },

    resizePreview: function()
    {
      var fieldsHeight = this.$id('fields').outerHeight();
      var tabHeight = this.$('a[data-toggle="tab"]').outerHeight();
      var previewHeight = fieldsHeight - tabHeight;

      this.$id('preview').css('height', previewHeight + 'px');
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
          value: answers[i]
            ? answers[i].answer
            : (/referrals/i.test(question._id) ? '1' : 'na')
        });
      });

      this.$id('survey').select2('val', surveyId);
      this.$id('answers').html(answersHtml.join(''));
    },

    serializeForm: function(formData)
    {
      formData.division = this.$id('superior').select2('data').division;

      return formData;
    },

    handleSuccess: function()
    {
      if (this.options.fixing)
      {
        this.redirectToNext();
      }
      else
      {
        FormView.prototype.handleSuccess.call(this);
      }
    },

    redirectToNext: function()
    {
      var req = this.ajax({
        url: '/opinionSurveys/omrResults?select(_id)&status=unrecognized'
      });
      var view = this;

      req.fail(function()
      {
        view.broker.publish('router.navigate', {
          url: '#opinionSurveyOmrResults',
          trigger: true
        });
      });

      req.done(function(res)
      {
        var url = '#opinionSurveyOmrResults';

        if (res && res.collection && res.collection[0])
        {
          url += '/' + res.collection[0]._id;
        }

        view.broker.publish('router.navigate', {
          url: url,
          trigger: true
        });
      });
    }

  });
});
