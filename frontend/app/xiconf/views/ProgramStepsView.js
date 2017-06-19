// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/View',
  'app/xiconf/templates/programSteps'
], function(
  _,
  time,
  View,
  template
) {
  'use strict';

  var UNIT_PREFIXES = {
    m: 0.001,
    k: 1000,
    M: 1000000,
    G: 1000000000
  };

  return View.extend({

    template: template,

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        steps: this.serializeSteps()
      };
    },

    serializeSteps: function()
    {
      var program = this.model.get('program');

      if (!program)
      {
        return [];
      }

      return program.steps.map(this.serializeStep, this).filter(function(step) { return step !== null; });
    },

    serializeStep: function(step, i)
    {
      if (!step.enabled)
      {
        return null;
      }

      var stepProgress = (this.model.get('steps') || [])[i];
      var viewData = {
        index: i,
        type: step.type,
        label: _.isString(step.label) && step.label.length ? step.label : null,
        progressBarWidth: '0%',
        stepClassName: 'is-idle',
        progressBarClassName: 'progress-bar-default',
        value: '',
        unit: null,
        minValue: null,
        maxValue: null,
        props: []
      };

      var programType = this.model.get('program').type;

      if (programType === 't24vdc')
      {
        this.serializeT24vdcStep(step, viewData);
      }
      else if (programType === 'glp2')
      {
        this.serializeGlp2Step(step, viewData);
      }

      if (stepProgress)
      {
        viewData.value = this.prepareStepValue(stepProgress.value, stepProgress.unit, viewData.unit);
        viewData.progressBarWidth = stepProgress.progress + '%';
        viewData.stepClassName = 'is-' + stepProgress.status;
        viewData.progressBarClassName = this.getProgressBarClassName(stepProgress.status);
      }

      return viewData;
    },

    serializeT24vdcStep: function(step, viewData)
    {
      switch (step.type)
      {
        case 'pe':
          viewData.unit = 'Ω';
          viewData.maxValue = step.resistanceMax.toLocaleString();
          viewData.props.push(
            {key: 'T', value: time.toString(step.startTime + step.duration, false, true)},
            {key: 'R', sub: 'max', value: viewData.maxValue, unit: 'Ω'},
            {key: 'U', value: step.voltage.toLocaleString(), unit: 'V'}
          );
          break;

        case 'sol':
          viewData.unit = 'V';
          viewData.props.push(
            {key: 'U', value: step.voltage.toLocaleString(), unit: 'V'}
          );
          break;

        case 'fn':
          viewData.unit = 'W';
          viewData.minValue = step.powerMin.toLocaleString();
          viewData.maxValue = step.powerMax.toLocaleString();
          viewData.props.push(
            {key: 'T', value: time.toString(step.startTime + step.duration, false, true)},
            {key: 'U', value: step.voltage.toLocaleString(), unit: 'V'},
            {key: 'P', sub: 'req', value: step.powerReq.toLocaleString(), unit: 'W'},
            {key: 'P', sub: 'min', value: viewData.minValue, unit: 'W'},
            {key: 'P', sub: 'max', value: viewData.maxValue, unit: 'W'}
          );
          break;

        case 'wait':
          if (step.kind === 'auto')
          {
            viewData.props.push({key: 'T', value: time.toString(step.duration, false, true)});
          }

          viewData.props.push({key: 'U', value: step.voltage.toLocaleString(), unit: 'V'});
          break;
      }
    },

    serializeGlp2Step: function(step, viewData)
    {
      switch (step.type)
      {
        case 'pe':
          viewData.unit = 'Ω';
          viewData.maxValue = step.setValue.toLocaleString();
          viewData.props.push(
            {key: 'T', value: time.toString(step.duration, false, true)},
            {key: 'R', sub: 'set', value: viewData.maxValue, unit: viewData.unit},
            {key: 'I', sub: 'pr', value: step.ipr.toLocaleString(), unit: 'A'},
            {key: 'U', value: step.u.toLocaleString(), unit: 'V'}
          );
          break;

        case 'iso':
          viewData.unit = ['MΩ', 'mA', 'V'][step.mode];
          viewData.minValue = step.setValue.toLocaleString();
          viewData.props.push(
            {key: 'T', value: time.toString(step.startTime + step.duration, false, true)},
            {key: ['R', 'I', 'A'][step.mode], sub: 'set', value: viewData.minValue, unit: viewData.unit},
            {key: 'U', value: step.u.toLocaleString(), unit: 'V'},
            {key: 'R', sub: 'max', value: step.rMax.toLocaleString(), unit: 'MΩ'}
          );
          break;

        case 'program':
          viewData.props.push({key: 'U', value: step.voltage.toLocaleString(), unit: 'V'});
          break;

        case 'fn':
          viewData.unit = ['A', 'W', 'W', 0, 0, 0, 'V'][step.mode] || null;
          viewData.props.push(
            {key: 'T', value: time.toString(step.startTime + step.duration, false, true)},
            {
              key: ['I', 'P', 'P', 'cosφ', 0, 0, 'U', 'RPM'][step.mode] || null,
              sub: ['set', 'apparent', 'active', 0, 0, 0, 'residual'][step.mode] || null,
              value: step.setValue.toLocaleString(),
              unit: viewData.unit
            },
            {key: 'U', value: step.voltage.toLocaleString(), unit: 'V'}
          );

          if (step.mode !== 5)
          {
            var relTolerance = step.lowerToleranceRel !== 0 || step.upperToleranceRel !== 0;
            var minValue = relTolerance
              ? (Math.round(step.setValue * ((100 - step.lowerToleranceRel) / 100) * 100) / 100)
              : step.lowerToleranceAbs;
            var maxValue = relTolerance
              ? (Math.round(step.setValue * ((100 + step.upperToleranceRel) / 100) * 100) / 100)
              : step.upperToleranceAbs;

            viewData.minValue = minValue.toLocaleString();
            viewData.maxValue = maxValue.toLocaleString();
          }

          if (step.lampCount)
          {
            viewData.props.push(
              {key: 'FL', sub: 'count', value: step.lampCount},
              {key: 'FL', sub: 'time', value: time.toString(step.lampDuration || 0)}
            );
          }
          break;

        case 'vis':
          viewData.props.push(
            {key: 'T', sub: 'wait', value: time.toString(step.duration, false, true)},
            {key: 'T', sub: 'max', value: time.toString(step.maxDuration, false, true)}
          );
          break;

        case 'wait':
          if (step.kind === 'auto')
          {
            viewData.props.push({key: 'T', value: time.toString(step.duration, false, true)});
          }
          break;
      }
    },

    getProgressBarClassName: function(status)
    {
      var progressBarClassName = status === 'success'
        ? 'progress-bar-success'
        : status === 'failure' ? 'progress-bar-danger' : 'progress-bar-warning';

      if (status === 'active')
      {
        progressBarClassName += ' progress-bar-striped active';
      }

      return progressBarClassName;
    },

    prepareStepValue: function(rawValue, rawUnit, targetUnit)
    {
      if (!rawValue)
      {
        return '0';
      }

      if (rawValue < 0)
      {
        return '';
      }

      if (rawUnit && rawUnit.length > 1)
      {
        rawValue = this.convertRawValue(rawValue, rawUnit, targetUnit);
      }

      if (rawValue < 1)
      {
        return (Math.round(rawValue * 1000) / 1000).toString().substr(1);
      }

      var value;

      if (rawValue < 100)
      {
        value = Math.round(rawValue * 100) / 100;
      }
      else if (rawValue < 1000)
      {
        value = Math.round(rawValue * 10) / 10;
      }
      else
      {
        value = Math.round(rawValue);
      }

      return value.toLocaleString().replace(/\s+/g, '');
    },

    convertRawValue: function(rawValue, rawUnit, targetUnit)
    {
      var rawUnitPrefix = rawUnit.charAt(0);
      var targetUnitPrefix = targetUnit.charAt(0);

      if (rawUnitPrefix === targetUnitPrefix)
      {
        return rawValue;
      }

      var rawMul = UNIT_PREFIXES[rawUnitPrefix];
      var targetMul = UNIT_PREFIXES[targetUnitPrefix];

      if (!rawMul || !targetMul)
      {
        return rawValue;
      }

      return rawValue * rawMul / targetMul;
    }

  });
});
