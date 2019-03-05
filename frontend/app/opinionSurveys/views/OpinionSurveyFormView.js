// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'form2js',
  'js2form',
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
  'app/opinionSurveys/templates/formEmployerTr',
  'app/opinionSurveys/templates/formSuperiorTr',
  'app/opinionSurveys/templates/formQuestionTr'
], function(
  _,
  $,
  form2js,
  js2form,
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
  renderEmployerTr,
  renderSuperiorTr,
  renderQuestionTr
) {
  'use strict';

  function clone(o)
  {
    return JSON.parse(JSON.stringify(o));
  }

  return FormView.extend({

    template: template,

    employerCounter: 0,
    superiorCounter: 0,
    questionCounter: 0,

    events: _.assign({

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

        if ($table.hasClass('opinionSurveys-form-employersTable'))
        {
          this.setUpEmployersSelect2(true);
        }

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
        var mainLang = this.$id('lang').find('input').first().val();
        var selectedLang = this.$('input[name="langSwitch"]:checked').val();

        if (selectedLang !== mainLang)
        {
          this.enableLang();
        }

        var formData = this.serializeForm(form2js(this.el));

        if (selectedLang !== mainLang)
        {
          this.disableLang();
        }

        var req = this.ajax({
          method: 'POST',
          url: '/opinionSurveys/preview?lang=' + selectedLang,
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
      },

      'change input[name="langSwitch"]': function()
      {
        var mainLang = this.$id('lang').find('input').first().val();
        var selectedLang = this.$('input[name="langSwitch"]:checked').val();

        if (!this.selectedLang)
        {
          this.selectedLang = selectedLang;
        }

        if (selectedLang === this.selectedLang)
        {
          return;
        }

        var langProps = ['company', 'intro', 'employer', 'superior', 'employers', 'superiors', 'questions'];
        var oldFormData = _.pick(this.getFormData(), langProps);
        var newFormData;
        var attrs = this.model.attributes;

        if (selectedLang === mainLang)
        {
          newFormData = _.pick(attrs, langProps);

          this.enableLang();
        }
        else
        {
          if (!attrs.lang)
          {
            attrs.lang = {};
          }

          if (!attrs.lang[selectedLang])
          {
            attrs.lang[selectedLang] = clone(_.pick(attrs, langProps));
          }

          newFormData = attrs.lang[selectedLang];

          this.disableLang();
        }

        if (this.selectedLang === mainLang)
        {
          _.assign(attrs, oldFormData);
        }
        else
        {
          this.copyLang(attrs, attrs.lang[this.selectedLang], oldFormData);
        }

        js2form(this.el, newFormData, '.', null, false, false);

        this.selectedLang = selectedLang;
      }

    }, FormView.prototype.events, {

      submit: function()
      {
        this.sortSuperiors = true;

        this.$id('lang').find('input').first().parent().click();

        this.submitForm();

        this.sortSuperiors = false;

        return false;
      }

    }),

    enableLang: function()
    {
      this.$id('employers').select2('enable');
      this.$id('superiors').select2('enable');
      this.$id('questions').select2('enable');
      this.$('input[name$="division"]').select2('enable');
      this.$('input[name$="short"]').prop('disabled', false);
      this.$('.actions .btn').prop('disabled', false);
    },

    disableLang: function()
    {
      this.$id('employers').select2('disable');
      this.$id('superiors').select2('disable');
      this.$id('questions').select2('disable');
      this.$('input[name$="division"]').select2('disable');
      this.$('input[name$="short"]').prop('disabled', true);
      this.$('.actions .btn').prop('disabled', true);
    },

    copyLang: function(main, lang, formData)
    {
      var employersMap = {};
      var superiorsMap = {};
      var questionsMap = {};

      formData.employers.forEach(function(s) { employersMap[s._id] = s; });
      formData.superiors.forEach(function(s) { superiorsMap[s._id] = s; });
      formData.questions.forEach(function(q) { questionsMap[q._id] = q; });

      lang.company = formData.company || '';
      lang.intro = formData.intro || '';
      lang.employer = formData.employer || '';
      lang.superior = formData.superior || '';
      lang.employers = [];
      lang.superiors = [];
      lang.questions = [];

      main.employers.forEach(function(e)
      {
        lang.employers.push(employersMap[e._id] || clone(e));
      });

      main.superiors.forEach(function(s)
      {
        lang.superiors.push(superiorsMap[s._id] || clone(s));
      });

      main.questions.forEach(function(s)
      {
        lang.questions.push(questionsMap[s._id] || clone(s));
      });
    },

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.sortSuperiors = false;
    },

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

      return formData;
    },

    serializeForm: function(formData)
    {
      if (!formData.employers)
      {
        formData.employers = [];
      }

      if (!formData.superiors)
      {
        formData.superiors = [];
      }

      if (this.sortSuperiors)
      {
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
      }

      if (!formData.questions)
      {
        formData.questions = [];
      }

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.renderEmployersTable();
      this.renderSuperiorsTable();
      this.renderQuestionsTable();

      this.setUpEmployersSelect2();
      this.setUpSuperiorsSelect2();
      this.setUpQuestionsSelect2();

      this.$id('lang').find('input').first().parent().click();

      this.$('input[autofocus]').focus();
    },

    setUpEmployersSelect2: function(rebuild)
    {
      var $table = this.$id('employersTable');
      var $tbody = $table.find('tbody');
      var $select2 = buildEmployersSelect2(this.$id('employers'), $tbody);

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

        var employer = e.added.employer;

        var $tr = $(renderEmployerTr({
          i: ++view.employerCounter,
          employer: {
            _id: employer.id,
            short: employer.get('short'),
            full: employer.get('full')
          }
        }));

        $tr.appendTo($tbody);
        $table.css('display', '');
        $select2.focus();

        buildEmployersSelect2($select2, $tbody);
      });

      function buildEmployersSelect2($select2, $tbody)
      {
        var selectedEmployers = $tbody.find('input[name$="_id"]').map(function() { return this.value; }).get();

        return $select2.select2({
          minimumResultsForSearch: -1,
          data: dictionaries.employers.map(function(employer)
          {
            return {
              id: employer.id,
              text: employer.get('short'),
              employer: employer
            };
          }).filter(function(d)
          {
            return selectedEmployers.indexOf(d.id) === -1;
          })
        });
      }
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
        $select2.focus();
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
        $select2.focus();

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

    renderEmployersTable: function()
    {
      var view = this;
      var $tbody = this.$id('employersTable').find('tbody').empty();

      (this.model.get('employers') || []).forEach(function(employer)
      {
        var $tr = $(renderEmployerTr({
          i: ++view.employerCounter,
          employer: employer
        }));

        $tbody.append($tr);
      });
    },

    renderSuperiorsTable: function()
    {
      var view = this;
      var $tbody = this.$id('superiorsTable').find('tbody').empty();

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
      var $tbody = this.$id('questionsTable').find('tbody').empty();

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
