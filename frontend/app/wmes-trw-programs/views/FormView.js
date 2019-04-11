// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/wmes-trw-tests/dictionaries',
  '../Program',
  'app/wmes-trw-programs/templates/form'
], function(
  _,
  FormView,
  idAndLabel,
  dictionaries,
  Program,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'click #-addStep': function()
      {
        this.addStep();
      },

      'click [data-action="removeStep"]': function(e)
      {
        var view = this;
        var $step = view.$(e.target).closest('.panel');

        $step.fadeOut('fast', function()
        {
          $step.remove();
          view.recountSteps();
        });
      },

      'click [data-action="moveStepUp"]': function(e)
      {
        var $step = this.$(e.target).closest('.panel');

        $step.insertBefore($step.prev());
        this.recountSteps();
      },

      'click [data-action="moveStepDown"]': function(e)
      {
        var $step = this.$(e.target).closest('.panel');

        $step.insertAfter($step.next());
        this.recountSteps();
      },

      'change input[name$=".name"]': function(e)
      {
        this.updateStepTitle(this.$(e.target).closest('.panel')[0]);
      },

      'change #-tester': function()
      {
        this.loadTester();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.stepI = 0;
      this.io = null;
    },

    afterRender: function()
    {
      (this.model.get('steps') || []).forEach(this.addStep, this);

      FormView.prototype.afterRender.call(this);

      this.$id('tester').select2({
        data: dictionaries.testers.map(idAndLabel)
      });

      this.addStep();
      this.loadTester();
    },

    serializeForm: function(formData)
    {
      if (!formData.steps)
      {
        formData.steps = [];
      }

      formData.steps.forEach(function(step)
      {
        step.setIo = (step.setIo || '').split(',').filter(function(v) { return v.length > 0; });
        step.checkIo = (step.checkIo || '').split(',').filter(function(v) { return v.length > 0; });
      });

      formData.steps = formData.steps.filter(function(step)
      {
        return !!step.name
          || !!step.description
          || !!step.setIo.length
          || !!step.checkIo.length;
      });

      return formData;
    },

    addStep: function(step)
    {
      var $steps = this.$id('steps');

      if (!this.stepTemplate)
      {
        this.stepTemplate = $steps.html();

        $steps.html('');
      }

      var html = this.stepTemplate.replace(/\${i}/g, this.stepI);

      $steps.append(html);

      var $step = this.$($steps[0].lastElementChild);

      this.updateStepTitle($step[0], $steps[0].childElementCount, step && step.name || '');
      this.setUpIoSelect2($step);

      ++this.stepI;
    },

    updateStepTitle: function(stepEl, n, name)
    {
      if (n == null)
      {
        n = Array.prototype.indexOf.call(stepEl.parentNode.children, stepEl) + 1;
      }

      var hd = this.t('steps:hd', {n: n});

      if (name == null)
      {
        name = stepEl.querySelector('input[name$="name"]').value;
      }

      if (name)
      {
        hd += ': ' + Program.colorize(name);
      }

      stepEl.querySelector('.panel-heading-text').innerHTML = hd;
    },

    recountSteps: function()
    {
      var view = this;

      view.$id('steps').children().each(function(i)
      {
        view.updateStepTitle(this, i + 1);
      });
    },

    setUpIoSelect2: function($step)
    {
      var view = this;
      var $steps = $step || view.$id('steps').children();

      $steps.each(function()
      {
        var $step = view.$(this);
        var $setIo = $step.find('input[name$="setIo"]');
        var $checkIo = $step.find('input[name$="checkIo"]');

        if (view.io === null)
        {
          $setIo.prop('readonly', true).addClass('form-control');
          $checkIo.prop('readonly', true).addClass('form-control');

          return;
        }

        $setIo.val(_.intersection(
          $setIo.val().split(',').filter(function(v) { return v.length > 0; }),
          view.io.outputIds
        ).join(','));

        $setIo.prop('readonly', false).removeClass('form-control').select2({
          multiple: true,
          allowClear: true,
          data: view.io.output
        });

        $checkIo.val(_.intersection(
          $checkIo.val().split(',').filter(function(v) { return v.length > 0; }),
          view.io.inputIds
        ).join(','));

        $checkIo.prop('readonly', false).removeClass('form-control').select2({
          multiple: true,
          allowClear: true,
          data: view.io.input
        });
      });
    },

    loadTester: function()
    {
      var view = this;
      var testerId = view.$id('tester').val();

      if (!testerId)
      {
        return;
      }

      var req = view.ajax({
        url: '/trw/testers/' + testerId
      });

      req.done(function(tester)
      {
        view.io = {};

        tester.io.forEach(function(io)
        {
          if (!view.io[io.type])
          {
            view.io[io.type] = [];
            view.io[io.type + 'Ids'] = [];
          }

          view.io[io.type].push({
            id: io._id,
            text: io.name + ' [' + io.device + ':' + io.channel + ']'
          });
          view.io[io.type + 'Ids'].push(io._id);
        });

        Object.keys(view.io).forEach(function(type)
        {
          if (/Ids$/.test(type))
          {
            return;
          }

          view.io[type].sort(function(a, b)
          {
            return a.id.localeCompare(b.id, undefined, {numeric: true, ignorePunctuation: true});
          });
        });

        view.setUpIoSelect2();
      });
    }

  });
});
