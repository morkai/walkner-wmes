// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'form2js',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/data/orgUnits',
  'app/users/util/setUpUserSelect2',
  '../dictionaries',
  '../OpinionSurvey',
  '../util/formatQuestionResult',
  'app/opinionSurveys/templates/form',
  'app/opinionSurveys/templates/formSuperiorTr',
  'app/opinionSurveys/templates/formQuestionTr'
], function(
  _,
  $,
  form2js,
  t,
  time,
  user,
  viewport,
  buttonGroup,
  idAndLabel,
  FormView,
  orgUnits,
  setUpUserSelect2,
  dictionaries,
  OpinionSurvey,
  formatQuestionResult,
  template,
  renderSuperiorTr,
  renderQuestionTr
) {
  'use strict';

  return FormView.extend({

    template: template,

    superiorCounter: 0,
    questionCounter: 0,

    events: _.extend({

      'click .opinionSurveys-form-deleteRow': function(e)
      {
        var $tr = this.$(e.currentTarget).closest('tr');
        var $table = $tr.closest('table');

        $tr.fadeOut('fast', function()
        {
          $(this).remove();

          if (!$table.find('tbody').children().length)
          {
            $table.css('display', 'none');
          }
        });

        if ($table.hasClass('opinionSurveys-form-questionsTable'))
        {
          this.setUpQuestionsSelect2(true);
        }
      },

      'click .opinionSurveys-form-moveRowUp': function(e)
      {
        var $btn = this.$(e.currentTarget);
        var $thisTr = $btn.closest('tr');
        var $prevTr = $thisTr.prev();

        if ($prevTr.length)
        {
          $thisTr.insertBefore($prevTr);
        }
        else
        {
          var $childTrs = $thisTr.parent().children();

          if ($childTrs.length > 1)
          {
            $thisTr.insertAfter($childTrs.last());
          }
        }

        $btn.focus();
      },

      'click .opinionSurveys-form-moveRowDown': function(e)
      {
        var $btn = this.$(e.currentTarget);
        var $thisTr = $btn.closest('tr');
        var $nextTr = $thisTr.next();

        if ($nextTr.length)
        {
          $thisTr.insertAfter($nextTr);
        }
        else
        {
          var $childTrs = $thisTr.parent().children();

          if ($childTrs.length > 1)
          {
            $thisTr.insertBefore($childTrs.first());
          }
        }

        $btn.focus();
      },

      'click #-preview': function()
      {
        if (!this.el.checkValidity())
        {
          this.$id('submit').click();

          return;
        }

        var $btn = this.$id('preview').prop('disabled', true);
        var formData = this.serializeForm(form2js(this.el));
        var req = this.ajax({
          method: 'POST',
          url: '/opinionSurveys/preview',
          data: JSON.stringify(formData)
        });

        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('opinionSurveys', 'FORM:ERROR:previewFailure')
          });
        });

        req.done(this.openPreviewWindow.bind(this));

        req.always(function()
        {
          $btn.prop('disabled', false);
        });
      }

    }, FormView.prototype.events),

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      if (formData.startDate)
      {
        formData.startDate = time.format(formData.startDate, 'YYYY-MM-DD');
      }

      if (formData.endDate)
      {
        formData.endDate = time.format(formData.endDate, 'YYYY-MM-DD');
      }

      formData.employers = (formData.employers || []).map(function(d) { return d._id; }).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.employers = this.$id('employers').select2('data').map(function(d)
      {
        return dictionaries.employers.get(d.id).toJSON();
      });

      if (!formData.superiors)
      {
        formData.superiors = [];
      }

      formData.superiors.sort(function(a, b)
      {
        if (a.division === b.division)
        {
          return a.full.localeCompare(b.full);
        }

        var aMatches = a.division.match(/([a-z])$/);
        var bMatches = b.division.match(/([a-z])$/);

        if (aMatches && !bMatches)
        {
          return -1;
        }

        if (!aMatches && bMatches)
        {
          return 1;
        }

        if (!aMatches && !bMatches)
        {
          return a.division.localeCompare(b.division);
        }

        return aMatches[1].localeCompare(bMatches[1]);
      });

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.renderSuperiorsTable();
      this.renderQuestionsTable();

      this.setUpEmployersSelect2();
      this.setUpSuperiorsSelect2();
      this.setUpQuestionsSelect2();

      this.$('input[autofocus]').focus();
    },

    setUpEmployersSelect2: function()
    {
      this.$id('employers').select2({
        multiple: true,
        data: dictionaries.employers.map(idAndLabel)
      });
    },

    setUpSuperiorsSelect2: function()
    {
      var $table = this.$id('superiorsTable');
      var $tbody = $table.find('tbody');
      var $select2 = setUpUserSelect2(this.$id('superiors'));
      var view = this;

      if (!$tbody.children().length)
      {
        $table.css('display', 'none');
      }

      $select2.on('change', function(e)
      {
        $select2.select2('data', null);

        if (!e.added)
        {
          return;
        }

        var user = e.added.user;

        if ($tbody.find('[value="' + user._id + '"]').length)
        {
          return;
        }

        var divisionId = '';

        if (user.orgUnitType === 'division')
        {
          divisionId = user.orgUnitId;
        }
        else if (user.orgUnitType === 'subdivision')
        {
          divisionId = orgUnits.getByTypeAndId('subdivision', user.orgUnitId).get('division');
        }

        var division = dictionaries.divisions.get(divisionId);

        if (!division)
        {
          division = dictionaries.divisions.at(0);
        }

        var $tr = $(renderSuperiorTr({
          i: ++view.superiorCounter,
          superior: {
            _id: user._id,
            full: user.lastName + ' ' + user.firstName,
            short: user.lastName + ' ' + user.firstName.substring(0, 1) + '.',
            division: division ? division.id : ''
          }
        }));

        $tbody.append($tr);
        $table.css('display', '');
        view.setUpSuperiorsDivisionSelect2($tr);
        $tr.find('[name$="short"]').select();
      });
    },

    setUpSuperiorsDivisionSelect2: function($tr)
    {
      $tr.find('[name$="division"]').select2({
        minimumResultsForSearch: -1,
        data: dictionaries.divisions.map(function(d)
        {
          return {
            id: d.id,
            text: d.get('full') + ' (' + d.get('short') + ')'
          };
        })
      });
    },

    setUpQuestionsSelect2: function(rebuild)
    {
      var $table = this.$id('questionsTable');
      var $tbody = $table.find('tbody');
      var $select2 = buildQuestionsSelect2(this.$id('questions'), $tbody);

      if (rebuild)
      {
        return;
      }

      var view = this;

      if (!$tbody.children().length)
      {
        $table.css('display', 'none');
      }

      $select2.on('change', function(e)
      {
        $select2.select2('data', null);

        if (!e.added)
        {
          return;
        }

        var question = e.added.question;

        var $tr = $(renderQuestionTr({
          i: ++view.questionCounter,
          question: {
            _id: question.id,
            short: question.get('short'),
            full: question.get('full')
          }
        }));

        $tr.appendTo($tbody);
        $table.css('display', '');
        $tr.find('[name$="short"]').select();

        buildQuestionsSelect2($select2, $tbody);
      });

      function buildQuestionsSelect2($select2, $tbody)
      {
        var selectedQuestions = $tbody.find('input[name$="_id"]').map(function() { return this.value; }).get();

        return $select2.select2({
          formatResult: formatQuestionResult,
          minimumResultsForSearch: -1,
          data: dictionaries.questions.map(function(question)
          {
            return {
              id: question.id,
              text: question.get('short'),
              question: question
            };
          }).filter(function(d)
          {
            return selectedQuestions.indexOf(d.id) === -1;
          })
        });
      }
    },

    renderSuperiorsTable: function()
    {
      var view = this;
      var $tbody = this.$id('superiorsTable').find('tbody');

      (this.model.get('superiors') || []).forEach(function(superior)
      {
        var $tr = $(renderSuperiorTr({
          i: ++view.superiorCounter,
          superior: superior
        }));

        $tbody.append($tr);
        view.setUpSuperiorsDivisionSelect2($tr);
      });
    },

    renderQuestionsTable: function()
    {
      var view = this;
      var $tbody = this.$id('questionsTable').find('tbody');

      (this.model.get('questions') || []).forEach(function(question)
      {
        var $tr = $(renderQuestionTr({
          i: ++view.questionCounter,
          question: question
        }));

        $tbody.append($tr);
      });
    },

    openPreviewWindow: function(previewId)
    {
      var url = '/opinionSurveys/' + previewId + '.pdf?recreate=1';
      var windowName = 'OPINION_SURVEY_PREVIEW';
      var screen = window.screen;
      var width = screen.availWidth * 0.6;
      var height = screen.availHeight * 0.8;
      var left = Math.floor((screen.availWidth - width) / 2);
      var top = Math.floor((screen.availHeight - height) / 2);
      var windowFeatures = 'resizable,scrollbars,location=no'
        + ',top=' + top
        + ',left=' + left
        + ',width=' + Math.floor(width)
        + ',height=' + Math.floor(height);
      var previewWindow = window.open(url, windowName, windowFeatures);

      if (!previewWindow)
      {
        viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('opinionSurveys', 'FORM:ERROR:previewPopupBlocked')
        });
      }
    }

  });
});
