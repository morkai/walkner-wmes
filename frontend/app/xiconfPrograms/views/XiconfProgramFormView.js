// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-xiconf project <http://lukasz.walukiewicz.eu/p/walkner-xiconf>

define([
  'jquery',
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/views/FormView',
  'app/xiconfPrograms/templates/form',
  'app/xiconfPrograms/templates/_waitForm',
  'app/xiconfPrograms/templates/_peForm',
  'app/xiconfPrograms/templates/_solForm',
  'app/xiconfPrograms/templates/_fnForm'
], function(
  $,
  _,
  t,
  time,
  FormView,
  formTemplate,
  waitFormTemplate,
  peFormTemplate,
  solFormTemplate,
  fnFormTemplate
) {
  'use strict';

  var STEP_TYPE_TO_TEMPLATE = {
    wait: waitFormTemplate,
    pe: peFormTemplate,
    sol: solFormTemplate,
    fn: fnFormTemplate
  };

  return FormView.extend({

    template: formTemplate,

    events: _.extend({

      'blur .xiconfPrograms-form-duration': function(e)
      {
        e.target.value = time.toString(time.toSeconds(e.target.value));

        this.recalcTotalTime(this.$(e.target).closest('.panel-body'));
      },

      'click #-addStep': function()
      {
        var stepTypeEl = this.$id('stepType')[0];
        var stepType = stepTypeEl.value;

        if (stepType === '')
        {
          stepTypeEl.focus();

          return;
        }

        stepTypeEl.selectedIndex = 0;

        this.addStep(stepType).find('input').first().focus();
        this.validateSteps();
        this.recalcStepNo();
      },

      'click .btn[role="moveStepUp"]': function(e)
      {
        var $step = this.$(e.currentTarget).closest('.panel');
        var $prev = $step.prev();

        if ($prev.length)
        {
          $step.insertBefore($prev);
          this.recalcStepNo();
          e.currentTarget.focus();
        }
      },

      'click .btn[role="moveStepDown"]': function(e)
      {
        var $step = this.$(e.currentTarget).closest('.panel');
        var $next = $step.next();

        if ($next.length)
        {
          $step.insertAfter($next);
          this.recalcStepNo();
          e.currentTarget.focus();
        }
      },

      'click .btn[role="removeStep"]': function(e)
      {
        this.$(e.currentTarget).closest('.panel').fadeOut('fast', function() { $(this).remove(); });
      },

      'change [name$="duration"]': function(e)
      {
        this.validateDuration(this.$(e.target));
      },

      'change [name$="powerReq"], [name$="powerRel"]': function(e)
      {
        var power = this.getPowerData(e.target);

        if (power.rel !== '')
        {
          var rel = power.rel / 100;

          power.min = Math.round(power.req * (1 - rel));
          power.max = Math.round(power.req * (1 + rel));
        }

        this.setPowerData(power);
      },

      'change [name$="powerMin"], [name$="powerMax"]': function(e)
      {
        var power = this.getPowerData(e.target);

        var minPercent = Math.abs(Math.round(100 - (power.min / power.req) * 100));
        var maxPercent = Math.abs(Math.round(100 - (power.max / power.req) * 100));

        power.rel = minPercent === maxPercent ? minPercent : '';

        this.setPowerData(power);
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.nextStepIndex = 0;
    },

    afterRender: function()
    {
      this.nextStepIndex = 0;

      this.model.get('steps').forEach(function(step)
      {
        if (step.enabled)
        {
          this.addStep(step.type);
        }
      }, this);

      FormView.prototype.afterRender.call(this);

      this.recalcStepNo();
      this.validateSteps();

      var view = this;

      this.$('.xiconfPrograms-stepPanel').each(function()
      {
        var $stepPanel = $(this);

        view.recalcTotalTime($stepPanel);
        view.recalcPower($stepPanel);
      });
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        stepTypes: this.model.constructor.STEP_TYPES
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.steps = _.map(_.where(formData.steps, {enabled: true}), function(step)
      {
        if (step.startTime !== undefined)
        {
          step.startTime = time.toString(step.startTime);
        }

        if (step.duration !== undefined)
        {
          step.duration = time.toString(step.duration);
        }

        return step;
      });

      return formData;
    },

    serializeForm: function(formData)
    {
      var numericProperties = ['voltage', 'powerReq', 'powerRel', 'powerMin', 'powerMax', 'resistanceMax'];

      formData.steps = _.map(formData.steps, function(step)
      {
        step.enabled = true;

        if (step.startTime !== undefined)
        {
          step.startTime = time.toSeconds(step.startTime);
        }

        if (step.duration !== undefined)
        {
          step.duration = time.toSeconds(step.duration);
        }

        _.forEach(numericProperties, function(property)
        {
          if (step[property] !== undefined)
          {
            step[property] = parseFloat(step[property]) || 0;
          }
        });

        return step;
      });

      return formData;
    },

    addStep: function(stepType)
    {
      var stepTemplate = STEP_TYPE_TO_TEMPLATE[stepType];

      if (!stepTemplate)
      {
        throw new Error("Invalid step type: " + stepType);
      }

      var $stepPanel = $(stepTemplate({
        idPrefix: this.idPrefix + '-' + this.nextStepIndex,
        stepIndex: this.nextStepIndex
      }));

      this.$id('steps').append($stepPanel);

      ++this.nextStepIndex;

      this.recalcTotalTime($stepPanel);

      return $stepPanel;
    },

    getPowerData: function(el)
    {
      var $row = this.$(el).closest('.row');
      var $powerReq = $row.find('input[name$="powerReq"]');
      var $powerRel = $row.find('input[name$="powerRel"]');
      var $powerMin = $row.find('input[name$="powerMin"]');
      var $powerMax = $row.find('input[name$="powerMax"]');

      return {
        $req: $powerReq,
        $rel: $powerRel,
        $min: $powerMin,
        $max: $powerMax,
        req: parseInt($powerReq.val(), 10) || 0,
        rel: parseInt($powerRel.val(), 10) || '',
        min: parseInt($powerMin.val(), 10) || 0,
        max: parseInt($powerMax.val(), 10) || 0
      };
    },

    setPowerData: function(power)
    {
      if (power.req < power.min)
      {
        power.min = power.req;
      }

      if (power.req > power.max)
      {
        power.max = power.req;
      }
      power.$req.val(power.req);
      power.$rel.val(power.rel || '');
      power.$min.val(power.min);
      power.$max.val(power.max);
    },

    validateDuration: function($duration)
    {
      if (!$duration.length)
      {
        return;
      }

      $duration[0].setCustomValidity(
        time.toSeconds($duration.val()) < 1 ? t('xiconfPrograms', 'FORM:ERROR:minDuration') : ''
      );
    },

    validateSteps: function()
    {
      this.$id('stepType')[0].setCustomValidity(
        this.$id('steps').children().length ? '' : t('xiconfPrograms', 'FORM:ERROR:requiredStep')
      );
    },

    recalcStepNo: function()
    {
      this.$('.xiconfPrograms-form-stepNo').each(function(stepIndex)
      {
        this.innerText = (stepIndex + 1) + '.';
      });
    },

    recalcTotalTime: function($stepPanel)
    {
      var $totalTime = $stepPanel.find('.xiconfPrograms-form-totalTime');

      if (!$totalTime.length)
      {
        return;
      }

      var totalTime = 0;

      $stepPanel.find('.xiconfPrograms-form-duration').each(function()
      {
        totalTime += time.toSeconds(this.value);
      });

      $totalTime.text(time.toString(totalTime));
    },

    recalcPower: function($stepPanel)
    {
      var $powerMin = $stepPanel.find('input[name$="powerMin"]');

      if ($powerMin.length)
      {
        return;
      }

      $powerMin.change();
    }

  });
});
