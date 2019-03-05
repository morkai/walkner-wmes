// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/opinionSurveyScanTemplates/templates/regionEditForm',
  'app/opinionSurveyScanTemplates/templates/regionEditFormOptionRow'
], function(
  _,
  t,
  viewport,
  View,
  template,
  optionRowTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function(e)
      {
        e.preventDefault();

        var question = this.$id('question').val();
        var options = this.$id('options').find('tr').map(function() { return this.dataset.id; }).get();

        this.trigger('success', {
          question: question,
          options: options
        });
      },
      'change #-question': function(e)
      {
        this.setUpAnswersSelect2();
        this.$id('options').empty();

        if (e.added && !_.includes(['comment', 'employer', 'superior'], e.added.id))
        {
          var view = this;
          var options = /referral/i.test(e.added.id)
            ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
            : ['no', 'na', 'yes'];

          options.forEach(function(id)
          {
            var answer = t.has('opinionSurveyScanTemplates', 'regionEditForm:answer:' + id)
              ? t('opinionSurveyScanTemplates', 'regionEditForm:answer:' + id)
              : id;

            view.addOption(id, answer);
          });
        }

        this.$id('answers').select2('focus');
      },
      'change #-answers': function(e)
      {
        var answer = e.added;

        if (!answer)
        {
          return;
        }

        this.addOption(answer.id, answer.text);
        this.$id('answers').select2('data', null);
      },
      'click .btn[data-action="up"]': function(e)
      {
        var $tr = this.$(e.currentTarget).closest('tr');
        var $prev = $tr.prev();

        if ($prev.length)
        {
          $tr.insertBefore($prev);
          this.recountOptions();
        }

        e.currentTarget.focus();
      },
      'click .btn[data-action="down"]': function(e)
      {
        var $tr = this.$(e.currentTarget).closest('tr');
        var $next = $tr.next();

        if ($next.length)
        {
          $tr.insertAfter($next);
          this.recountOptions();
        }

        e.currentTarget.focus();
      },
      'click .btn[data-action="remove"]': function(e)
      {
        var view = this;
        var $tr = this.$(e.currentTarget).closest('tr');

        $tr.fadeOut('fast', function()
        {
          $tr.remove();
          view.recountOptions();
        });
      }
    },

    initialize: function()
    {
      this.answerIdToTextMap = {};
    },

    getTemplateData: function()
    {
      return {
        region: this.model.region
      };
    },

    onDialogShown: function()
    {
      this.$id('question').select2('focus');
    },

    afterRender: function()
    {
      this.$id('question').select2({
        allowClear: true,
        placeholder: ' ',
        data: this.createQuestionData()
      });

      this.setUpAnswersSelect2();

      this.model.region.options.forEach(function(id)
      {
        var answer = this.answerIdToTextMap[id];

        if (answer)
        {
          this.addOption(id, answer);
        }
      }, this);
    },

    setUpAnswersSelect2: function()
    {
      this.$id('answers').select2({
        placeholder: ' ',
        data: this.createAnswersData()
      });
    },

    createQuestionData: function()
    {
      var data = [
        {id: 'comment', text: t('opinionSurveyScanTemplates', 'regionType:comment')},
        {id: 'employer', text: t('opinionSurveyScanTemplates', 'regionType:employer')},
        {id: 'superior', text: t('opinionSurveyScanTemplates', 'regionType:superior')}
      ];
      var questions = this.model.survey ? this.model.survey.get('questions') : [];

      questions.forEach(function(q)
      {
        data.push({
          id: q._id,
          text: q.short
        });
      });

      return data;
    },

    createAnswersData: function()
    {
      var survey = this.model.survey;
      var question = this.$id('question').val();
      var data;

      switch (question)
      {
        case '':
        case 'comment':
          data = [];
          break;

        case 'employer':
          data = !survey ? [] : survey.get('employers').map(function(employer)
          {
            return {
              id: employer._id,
              text: employer.full
            };
          });
          break;

        case 'superior':
          data = !survey ? [] : survey.get('superiors').map(function(superior)
          {
            return {
              id: superior._id,
              text: superior.full
            };
          });
          break;

        default:
          data = ['no', 'na', 'yes', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(function(id)
          {
            return {
              id: id,
              text: t.has('opinionSurveyScanTemplates', 'regionEditForm:answer:' + id)
                ? t('opinionSurveyScanTemplates', 'regionEditForm:answer:' + id)
                : id
            };
          });
          break;
      }

      this.answerIdToTextMap = {};

      data.forEach(function(item)
      {
        this.answerIdToTextMap[item.id] = item.text;
      }, this);

      return data;
    },

    addOption: function(id, answer)
    {
      var $options = this.$id('options');

      $options.append(optionRowTemplate({
        id: id,
        answer: answer,
        no: $options.children().length + 1
      }));
    },

    recountOptions: function()
    {
      this.$id('options').find('.is-number').each(function(i)
      {
        this.textContent = (i + 1) + '.';
      });
    }

  });
});
