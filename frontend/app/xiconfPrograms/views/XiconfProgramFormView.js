// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/views/FormView',
  '../XiconfProgram',
  'app/xiconfPrograms/templates/form',
  'app/xiconfPrograms/templates/_waitForm',
  'app/xiconfPrograms/templates/_peForm',
  'app/xiconfPrograms/templates/_isoForm',
  'app/xiconfPrograms/templates/_solForm',
  'app/xiconfPrograms/templates/_programForm',
  'app/xiconfPrograms/templates/_fnForm',
  'app/xiconfPrograms/templates/_visForm'
], function(
  $,
  _,
  t,
  time,
  FormView,
  XiconfProgram,
  formTemplate,
  waitFormTemplate,
  peFormTemplate,
  isoFormTemplate,
  solFormTemplate,
  programFormTemplate,
  fnFormTemplate,
  visFormTemplate
) {
  'use strict';

  var STEP_TYPE_TO_TEMPLATE = {
    wait: waitFormTemplate,
    pe: peFormTemplate,
    iso: isoFormTemplate,
    sol: solFormTemplate,
    program: programFormTemplate,
    fn: fnFormTemplate,
    vis: visFormTemplate
  };
  var TIME_PROPERTIES = [
    'startTime',
    'duration',
    'maxDuration',
    'ramp'
  ];

  return FormView.extend({

    template: formTemplate,

    events: _.assign({

      'blur .xiconfPrograms-form-duration': function(e)
      {
        e.target.value = time.toString(time.toSeconds(e.target.value), false, true);

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
        var view = this;

        view.$(e.currentTarget).closest('.panel').fadeOut('fast', function()
        {
          $(this).remove();
          view.recalcStepNo();
        });
      },

      'change [name="type"]': function(e)
      {
        var view = this;

        view.$id('steps').empty();

        var $stepType = view.$id('stepType');

        $stepType.find('option[value!=""]').remove();

        XiconfProgram.TYPES_TO_STEPS[e.target.value].forEach(function(stepType)
        {
          $stepType.append('<option value="' + stepType + '">' + view.t('step:' + stepType) + '</option>');
        });
      },

      'change [name$="uration"]': function(e)
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
      },

      'change .xiconfPrograms-form-glp2-mode': function(e)
      {
        this.updateGlp2SetValue(this.$(e.currentTarget).closest('.panel'));
      },
      'change .xiconfPrograms-form-glp2-tolerance': function(e)
      {
        this.toggleGlp2Tolerance(this.$(e.currentTarget).closest('.panel'));
      },
      'change .xiconfPrograms-form-glp2-tolerances input[type="number"]': function(e)
      {
        this.recalcGlp2Tolerance(this.$(e.currentTarget).closest('.panel'));
      },
      'change .xiconfPrograms-form-glp2-setValue': function(e)
      {
        this.recalcGlp2Tolerance(this.$(e.currentTarget).closest('.panel'));
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.nextStepIndex = 0;
    },

    afterRender: function()
    {
      var view = this;
      var editMode = this.options.editMode === true;

      this.nextStepIndex = 0;

      this.model.get('steps').forEach(function(step)
      {
        if (step.enabled)
        {
          this.addStep(step.type, view.model.get('type'));
        }
      }, this);

      FormView.prototype.afterRender.call(this);

      this.recalcStepNo();
      this.validateSteps();

      this.$('.xiconfPrograms-stepPanel').each(function()
      {
        var $stepPanel = $(this);

        view.recalcTotalTime($stepPanel);
        view.recalcPower($stepPanel);
        view.updateGlp2SetValue($stepPanel, !editMode);
      });
    },

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {
        programTypes: Object.keys(XiconfProgram.TYPES_TO_STEPS),
        stepTypes: XiconfProgram.TYPES_TO_STEPS[this.model.get('type')]
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.steps = _.map(_.where(formData.steps, {enabled: true}), function(step)
      {
        _.forEach(TIME_PROPERTIES, function(timeProperty)
        {
          if (step[timeProperty] !== undefined)
          {
            step[timeProperty] = time.toString(step[timeProperty]);
          }
        });

        return step;
      });

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.prodLines = (formData.prodLines || '')
        .split(';')
        .map(function(prodLine) { return prodLine.trim(); })
        .filter(function(prodLine) { return prodLine.length > 0; })
        .join('; ');

      formData.steps = _.map(formData.steps, function(step)
      {
        step.enabled = true;

        _.forEach(TIME_PROPERTIES, function(timeProperty)
        {
          if (step[timeProperty] !== undefined)
          {
            step[timeProperty] = time.toSeconds(step[timeProperty]);
          }
        });

        Object.keys(step).forEach(function(property)
        {
          var value = step[property];

          if (typeof value === 'string' && /^[0-9]+(\.[0-9]+)?$/.test(value))
          {
            step[property] = parseFloat(step[property]);
          }
        });

        return step;
      });

      return formData;
    },

    addStep: function(stepType, programType)
    {
      var stepTemplate = STEP_TYPE_TO_TEMPLATE[stepType];

      if (!stepTemplate)
      {
        throw new Error('Invalid step type: ' + stepType);
      }

      if (!programType)
      {
        programType = this.$('[name="type"]:checked').val();
      }

      var $stepPanel = this.renderPartial(stepTemplate, {
        idPrefix: this.idPrefix + '-' + this.nextStepIndex,
        stepIndex: this.nextStepIndex,
        programType: programType,
        inputs: XiconfProgram.GLP2_INPUTS
      });

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

      var invalidMinDuration = time.toSeconds($duration.val()) < 1;

      $duration[0].setCustomValidity(invalidMinDuration ? this.t('FORM:ERROR:minDuration') : '');

      var $visStepPanel = $duration.closest('.xiconfPrograms-stepPanel-vis');

      if (!$visStepPanel.length)
      {
        return;
      }

      var $minDuration = $visStepPanel.find('input[name$="duration"]');
      var $maxDuration = $visStepPanel.find('input[name$="maxDuration"]');
      var minDuration = time.toSeconds($minDuration.val());
      var maxDuration = time.toSeconds($maxDuration.val());
      var error = '';

      if (minDuration < maxDuration)
      {
        if (invalidMinDuration && $duration[0] === $maxDuration[0])
        {
          return;
        }
      }
      else
      {
        error = this.t('FORM:ERROR:minMaxDurations');
      }

      $maxDuration[0].setCustomValidity(error);
    },

    validateSteps: function()
    {
      this.$id('stepType')[0].setCustomValidity(
        this.$id('steps').children().length ? '' : this.t('FORM:ERROR:requiredStep')
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

      $totalTime.text(time.toString(totalTime, false, true));
    },

    recalcPower: function($stepPanel)
    {
      var $powerMin = $stepPanel.find('input[name$="powerMin"]');

      if ($powerMin.length)
      {
        return;
      }

      $powerMin.change();
    },

    updateGlp2SetValue: function($stepPanel, resetValues)
    {
      if (!$stepPanel.hasClass('xiconfPrograms-stepPanel-glp2'))
      {
        return;
      }

      var $mode = $stepPanel.find('[name$="mode"]');
      var optionEl = $mode.find('option[value=' + $mode.val() + ']')[0];
      var dataset = optionEl.dataset;
      var $setValue = $stepPanel.find('[name$="setValue"]');
      var $setValueLabel = $setValue.closest('.form-group').find('label');
      var $tolerances = $stepPanel.find('.xiconfPrograms-form-glp2-tolerances');
      var $minAbs = $tolerances.find('[name$="lowerToleranceAbs"]');
      var $maxAbs = $tolerances.find('[name$="upperToleranceAbs"]');
      var label = this.t(dataset.label);

      $setValueLabel.html(label);

      if (dataset.min === undefined)
      {
        $setValue.prop({
          min: 0,
          max: 1,
          step: 1,
          value: 0,
          readonly: true
        });
        $tolerances.find('input[type="number"]').prop({
          value: 0,
          readonly: true
        });
      }
      else
      {
        $setValue.prop({
          min: dataset.min,
          max: dataset.max,
          step: dataset.step,
          value: resetValues ? dataset.min : $setValue.val(),
          readonly: false
        });
        $minAbs.prop('step', dataset.step);
        $maxAbs.prop('step', dataset.step);
      }

      if ($tolerances.length)
      {
        var unitMatches = label.match(/( \[.*?\])/);
        var unit = unitMatches ? unitMatches[1] : '';

        $minAbs.prev().find('span').html(unit);
        $maxAbs.prev().find('span').html(unit);

        this.toggleGlp2Tolerance($stepPanel, resetValues);
      }
    },

    toggleGlp2Tolerance: function($stepPanel, resetValues)
    {
      var vis = $stepPanel.find('[name$="mode"]').val() === '5';
      var tolerance = $stepPanel.find('.xiconfPrograms-form-glp2-tolerance:checked').val();
      var $minRel = $stepPanel.find('[name$="lowerToleranceRel"]');
      var $maxRel = $stepPanel.find('[name$="upperToleranceRel"]');

      if (tolerance === undefined)
      {
        if ($minRel.val() === '0' && $maxRel.val() === '0')
        {
          tolerance = 'abs';
        }
        else
        {
          tolerance = 'rel';
        }

        $stepPanel.find('.xiconfPrograms-form-glp2-tolerance[value="' + tolerance + '"]').prop('checked', true);
      }

      var rel = tolerance === 'rel';
      var $minAbs = $stepPanel.find('[name$="lowerToleranceAbs"]');
      var $maxAbs = $stepPanel.find('[name$="upperToleranceAbs"]');
      var relReadonly = vis || !rel;
      var absReadonly = vis || rel;

      $minRel.prop('readonly', relReadonly);
      $maxRel.prop('readonly', relReadonly);
      $minAbs.prop('readonly', absReadonly);
      $maxAbs.prop('readonly', absReadonly);

      if (resetValues !== false)
      {
        $minRel.val(relReadonly ? '0' : '10');
        $maxRel.val(relReadonly ? '0' : '10');
        $minAbs.val('0');
        $maxAbs.val('0');
      }

      this.recalcGlp2Tolerance($stepPanel);
    },

    recalcGlp2Tolerance: function($stepPanel)
    {
      var $minRel = $stepPanel.find('[name$="lowerToleranceRel"]');

      if (!$minRel.length)
      {
        return;
      }

      var $maxRel = $stepPanel.find('[name$="upperToleranceRel"]');
      var $minAbs = $stepPanel.find('[name$="lowerToleranceAbs"]');
      var $maxAbs = $stepPanel.find('[name$="upperToleranceAbs"]');
      var setValue = parseFloat($stepPanel.find('[name$="setValue"]').val());
      var rel = !$minRel.prop('readonly');

      if (rel)
      {
        var stepParts = $minAbs.attr('step').split('.');
        var fractions = stepParts.length === 2 ? stepParts[1].length : 0;

        var minAbs = setValue * ((100 - parseInt($minRel.val(), 10)) / 100);
        var maxAbs = setValue * ((100 + parseInt($maxRel.val(), 10)) / 100);

        $minAbs.val(minAbs.toFixed(fractions));
        $maxAbs.val(maxAbs.toFixed(fractions));
      }
      else
      {
        $minRel.val('0');
        $maxRel.val('0');
      }
    }

  });
});
