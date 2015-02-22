// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/views/FormView',
  'app/xiconfPrograms/templates/form'
], function(
  _,
  t,
  time,
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.extend({}, FormView.prototype.events, {

      'blur .xiconfPrograms-form-duration': function(e)
      {
        e.target.value = time.toString(time.toSeconds(e.target.value));

        this.recalcTotalTime(this.$(e.target).closest('.panel-body'));
      },

      'change [name$="enabled"]': function(e)
      {
        var $enabled = this.$(e.target);
        var $panel = $enabled.closest('.checkbox').next();
        var enabled = $enabled.prop('checked');

        $panel.stop(true, false)[enabled ? 'fadeIn' : 'fadeOut']('fast');
        $panel.find('input').attr('required', enabled);

        var $steps = this.$('input[name$="enabled"]');
        var $enabledSteps = $steps.filter(':checked');

        $steps[0].setCustomValidity(
          $enabledSteps.length ? '' : t('xiconfPrograms', 'FORM:ERROR:requiredStep')
        );

        this.validateDuration($panel.find('[name$="duration"]'));
      },

      'change [name$="duration"]': function(e)
      {
        this.validateDuration(this.$(e.target));
      },

      'change #-fn-powerReq': function()
      {
        this.recalcPowerRelExtremes();
        this.recalcPowerMinMaxExtremes();
      },

      'change #-fn-powerRel': function(e)
      {
        e.target.value = Math.min(Math.max(parseInt(e.target.value, 10) || 0, 0), 100) || '';

        this.recalcPowerRelExtremes();
      },

      'change #-fn-powerMin, #-fn-powerMax': 'recalcPowerMinMaxExtremes'

    }),

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      var view = this;

      _.forEach(this.model.get('steps'), function(step)
      {
        if (!step.enabled)
        {
          view.$id('panel-' + step.type).hide();
        }
      });

      this.recalcTotalTime(this.$id('panel-pe'));
      this.recalcTotalTime(this.$id('panel-fn'));
      this.recalcPowerRelExtremes();
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.steps = formData.steps.map(function(step)
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

      formData.steps = formData.steps.map(function(step)
      {
        step.enabled = step.enabled === '1';

        if (step.startTime !== undefined)
        {
          step.startTime = time.toSeconds(step.startTime);
        }

        if (step.duration !== undefined)
        {
          step.duration = time.toSeconds(step.duration);
        }

        numericProperties.forEach(function(property)
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

    validateDuration: function($duration)
    {
      if (!$duration.length)
      {
        return;
      }

      var enabled = $duration.closest('.panel').prev().find('input').prop('checked');

      $duration[0].setCustomValidity(
        enabled && time.toSeconds($duration.val()) < 1 ? t('xiconfPrograms', 'FORM:ERROR:minDuration') : ''
      );
    },

    recalcTotalTime: function($panel)
    {
      var totalTime = 0;

      $panel.find('.xiconfPrograms-form-duration').each(function()
      {
        totalTime += time.toSeconds(this.value);
      });

      $panel.find('.xiconfPrograms-form-totalTime').text(time.toString(totalTime));
    },

    recalcPowerMinMaxExtremes: function()
    {
      var powerReq = parseInt(this.$id('fn-powerReq').val(), 10);
      var powerMin = parseInt(this.$id('fn-powerMin').val(), 10);
      var powerMax = parseInt(this.$id('fn-powerMax').val(), 10);

      if (!powerMin || powerMin > powerReq)
      {
        powerMin = powerReq;
      }

      if (!powerMax || powerMax < powerReq)
      {
        powerMax = powerReq;
      }

      if (powerMin > powerMax)
      {
        var minPower = powerMin;
        powerMin = powerMax;
        powerMax = minPower;
      }

      this.$id('fn-powerMin').val(powerMin);
      this.$id('fn-powerMax').val(powerMax);

      var relMin = Math.round((1 - (powerMin / powerReq)) * 100);
      var relMax = Math.round(((powerMax / powerReq) - 1) * 100);

      this.$id('fn-powerRel').val(relMin === relMax && relMin !== 0 ? relMin : '');
    },

    recalcPowerRelExtremes: function()
    {
      var powerRel = parseInt(this.$id('fn-powerRel').val(), 10);

      if (!powerRel)
      {
        return this.$id('fn-powerRel').val('');
      }

      var powerReq = parseInt(this.$id('fn-powerReq').val(), 10);
      var powerMin = Math.round(powerReq * (1 - powerRel / 100));
      var powerMax = Math.round(powerReq * (1 + powerRel / 100));

      this.$id('fn-powerMin').val(powerMin).attr('max', powerReq);
      this.$id('fn-powerMax').val(powerMax).attr('min', powerReq);
    }

  });
});
