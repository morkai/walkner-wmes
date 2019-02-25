// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  '../PlanSettingsCollection',
  'app/planning/templates/copySettingsDialog'
], function(
  _,
  t,
  time,
  viewport,
  View,
  PlanSettingsCollection,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'submit': function()
      {
        this.submitForm();

        return false;
      }

    },

    initialize: function()
    {
      var today = time.getMoment();

      if (today.hours() < 6)
      {
        today.subtract(1, 'days');
      }

      today.startOf('day');

      this.plans = new PlanSettingsCollection(null, {
        rqlQuery: 'select(_id)&sort(_id)&_id>'
          + time.utc.getMoment(today.format('YYYY-MM-DD'), 'YYYY-MM-DD').valueOf()
      });
    },

    getTemplateData: function()
    {
      return {
        source: this.model.getMoment().format('LL')
      };
    },

    afterRender: function()
    {
      this.loadTargetPlans();
      this.setUpMrpsSelect2();
    },

    loadTargetPlans: function()
    {
      var view = this;

      viewport.msg.loading();

      view.$id('submit').prop('disabled', true);
      view.$id('target').select2({data: []}).select2('enable', false);

      var req = view.plans.fetch();

      req.done(function(res)
      {
        viewport.msg.loaded();

        view.$id('target').select2({
          width: '100%',
          placeholder: view.t('copySettings:target:all'),
          allowClear: true,
          multiple: true,
          data: (res.collection || []).map(function(plan)
          {
            return {
              id: time.format(plan._id, 'YYYY-MM-DD'),
              text: time.format(plan._id, 'LL')
            };
          }).filter(function(item)
          {
            return item.id !== view.model.id;
          })
        }).select2('enable', true);

        view.$id('submit').prop('disabled', false);
      });

      req.fail(function()
      {
        viewport.msg.loadingFailed();
      });
    },

    setUpMrpsSelect2: function()
    {
      this.$id('mrps').select2({
        width: '100%',
        placeholder: this.t('copySettings:mrps:all'),
        allowClear: true,
        multiple: true,
        data: this.model.settings.mrps.map(function(mrp)
        {
          return {
            id: mrp.id,
            text: mrp.id
          };
        }).sort(function(a, b)
        {
          return a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true});
        })
      });

      this.$('input[name="filter"][value="in"]').prop('checked', true);
    },

    submitForm: function()
    {
      var view = this;

      var targetPlans = view.$id('target').select2('val');
      var filter = view.$('input[name="filter"]:checked').val();
      var mrps = view.$id('mrps').select2('val');
      var what = {};

      view.$('input[name="what[]"]').each(function()
      {
        if (this.checked)
        {
          what[this.value] = true;
        }
      });

      if (targetPlans.length === 0)
      {
        targetPlans = view.$id('target').data('select2').opts.data.map(function(item) { return item.id; });
      }

      if (mrps.length === 0)
      {
        mrps = view.$id('mrps').data('select2').opts.data.map(function(item) { return item.id; });
      }

      if (targetPlans.length === 0)
      {
        viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: view.t('copySettings:target:empty')
        });

        return;
      }

      if (_.isEmpty(what))
      {
        viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: view.t('copySettings:what:empty')
        });

        return;
      }

      var data = {
        mrps: {},
        lines: {},
        mrpLines: {}
      };

      if (filter === 'in')
      {
        mrps.forEach(function(mrp)
        {
          data.mrps[mrp] = true;
        });
      }
      else
      {
        view.model.settings.mrps.forEach(function(mrpSettings)
        {
          if (mrps.indexOf(mrpSettings.id) === -1)
          {
            data.mrps[mrpSettings.id] = true;
          }
        });
      }

      mrps = Object.keys(data.mrps);

      if (mrps.length === 0)
      {
        viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: view.t('copySettings:mrps:empty')
        });

        return;
      }

      view.model.settings.lines.forEach(function(lineSettings)
      {
        if (_.intersection(lineSettings.get('mrpPriority'), mrps).length)
        {
          data.lines[lineSettings.id] = lineSettings.pick([
            what.activeTime ? 'activeTime' : null
          ]);
        }
      });

      view.model.settings.mrps.forEach(function(mrpSettings)
      {
        if (!data.mrps[mrpSettings.id])
        {
          return;
        }

        mrpSettings.lines.forEach(function(mrpLineSettings)
        {
          if (!data.lines[mrpLineSettings.id])
          {
            return;
          }

          data.mrpLines[mrpSettings.id + ':' + mrpLineSettings.id] = mrpLineSettings.pick([
            what.workerCount ? 'workerCount' : null,
            what.orderPriority ? 'orderPriority' : null
          ]);
        });
      });

      view.$id('submit')
        .prop('disabled', true)
        .find('.fa-spinner')
        .removeClass('hidden');

      this.copyNext(targetPlans, data);
    },

    copyNext: function(targetPlans, data)
    {
      var view = this;
      var targetPlan = targetPlans.shift();

      if (!targetPlan)
      {
        viewport.closeDialog();

        return;
      }

      view.fetchSettings(targetPlan, function(targetSettings)
      {
        targetSettings.lines.forEach(function(lineSettings)
        {
          _.assign(lineSettings, data.lines[lineSettings._id]);
        });

        targetSettings.mrps.forEach(function(mrpSettings)
        {
          mrpSettings.lines.forEach(function(mrpLineSettings)
          {
            _.assign(mrpLineSettings, data.mrpLines[mrpSettings._id + ':' + mrpLineSettings._id]);
          });
        });

        view.saveSettings(
          targetPlan,
          targetSettings,
          view.copyNext.bind(view, targetPlans, data)
        );
      });
    },

    fetchSettings: function(targetPlan, done)
    {
      viewport.msg.loading();

      var view = this;
      var req = view.ajax({
        url: '/planning/settings/' + targetPlan
      });

      req.done(function(targetSettings)
      {
        viewport.msg.loaded();
        done(targetSettings);
      });

      req.fail(function()
      {
        viewport.msg.loadingFailed();
        view.fail();
      });
    },

    saveSettings: function(targetPlan, targetSettings, done)
    {
      viewport.msg.saving();

      var view = this;
      var req = view.ajax({
        method: 'PUT',
        url: '/planning/settings/' + targetPlan,
        data: JSON.stringify(targetSettings)
      });

      req.done(function()
      {
        viewport.msg.saved();
        done();
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();
        view.fail();
      });
    },

    fail: function()
    {
      this.$id('submit')
        .prop('disabled', false)
        .find('.fa-spinner')
        .addClass('hidden');
    }

  });
});
