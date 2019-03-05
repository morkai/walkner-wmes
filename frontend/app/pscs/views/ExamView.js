// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/pscs/templates/exam'
], function(
  _,
  t,
  user,
  time,
  viewport,
  FormView,
  template
) {
  'use strict';

  var VALID_ANSWERS = [2, 1, 4, 1, 3, 4, 2, 3];

  return FormView.extend({

    template: template,

    events: _.assign({

      'input #-personnelId': function(e)
      {
        e.target.setCustomValidity('');
      },
      'keydown #-personnelId': function(e)
      {
        if (e.keyCode === 13)
        {
          this.start();

          return false;
        }
      },
      'click #-start': 'start',
      'click [data-action="cancel"]': function()
      {
        this.model.clear();
        this.enterSection('start');
      },
      'click [data-action="next"]': function()
      {
        var $section = this.$id('section-' + this.section);
        var $answer = $section.find('input:checked');

        if ($answer.length)
        {
          this.enterSection(parseInt(this.section, 10) + 1);
        }
        else
        {
          $section.find('input[type="radio"]')[0].setCustomValidity(t('pscs', 'exam:required'));
          this.$id('submit').click();
        }
      },
      'click [data-action="prev"]': function()
      {
        this.enterSection(parseInt(this.section, 10) - 1);
      },
      'click [data-action="finish"]': 'finish',
      'change input[name^="answers"]': function(e)
      {
        if (!Array.isArray(this.model.attributes.answers))
        {
          this.model.attributes.answers = VALID_ANSWERS.map(function() { return -1; });
        }

        this.model.attributes.answers[e.target.dataset.question] = parseInt(e.target.value, 10);
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.section = 'start';
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.enterSection(this.section);
    },

    enterSection: function(newSection)
    {
      this.$id('section-' + this.section).addClass('hidden');

      this.$id('section-' + newSection)
        .removeClass('hidden')
        .find('input')
        .first()
        .focus();

      this.$('input[type="radio"]').each(function() { this.setCustomValidity(''); });

      this.section = newSection;
    },

    serializeForm: function(formData)
    {
      var answers = new Array(8);
      var validity = new Array(8);

      for (var i = 0; i < 8; ++i)
      {
        answers[i] = parseInt(formData.answers[i], 10) || -1;
        validity[i] = answers[i] === VALID_ANSWERS[i];
      }

      return {
        answers: answers,
        validity: validity
      };
    },

    handleSuccess: function()
    {
      if (this.model.get('status') === 'failed')
      {
        var validAnswerCount = this.model.get('validity').reduce(
          function(count, valid) { return count + (valid ? 1 : 0); },
          0
        );

        this.$id('validAnswers').text(t('pscs', 'exam:failure:valid', {
          count: validAnswerCount,
          gender: this.model.get('user').gender
        }));

        this.enterSection('failure');
      }
      else
      {
        this.enterSection('success');
      }
    },

    handleFailure: function()
    {
      this.showErrorMessage(t('pscs', 'exam:failure'));
    },

    start: function()
    {
      var view = this;
      var $personnelId = view.$id('personnelId');
      var personnelId = $personnelId.val().replace(/[^0-9]/g, '');

      $personnelId.val(personnelId);

      if (!personnelId.length)
      {
        $personnelId[0].setCustomValidity(t('pscs', 'exam:start:required'));
        view.$id('submit').click();

        return;
      }

      view.$id('start').prop('disabled', true);

      view.model.set({
        personnelId: personnelId,
        answers: [-1, -1, -1, -1, -1, -1, -1, -1]
      }, {silent: true});

      var req = this.promised(view.model.save());

      req.done(function()
      {
        view.enterSection('1');
      });

      req.fail(function(jqXhr)
      {
        if (jqXhr.status === 400)
        {
          var error = jqXhr.responseJSON.error;

          if (t.has('pscs', 'exam:start:' + error.message))
          {
            view.$id('personnelId')[0].setCustomValidity(t('pscs', 'exam:start:' + error.message));
            view.$id('submit').click();
          }

          return;
        }

        view.showErrorMessage(t('pscs', 'exam:start:failure'));
      });

      req.always(function()
      {
        view.$id('start').prop('disabled', false);
      });
    },

    finish: function()
    {
      this.$id('submit').click();
    }

  });
});
