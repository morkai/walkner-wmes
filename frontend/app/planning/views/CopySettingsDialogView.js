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

    template,

    events: {

      'submit': function()
      {
        this.submitForm();

        return false;
      },

      'click #-allMrps': function()
      {
        this.$id('mrps').select2('data', this.$id('mrps').data('select2').opts.data);
      }

    },

    initialize: function()
    {
      const today = time.getMoment();

      if (today.hours() < 6)
      {
        today.subtract(1, 'days');
      }

      today.startOf('day');

      const currentPlanTime = time.utc.getMoment(today.format('YYYY-MM-DD'), 'YYYY-MM-DD').valueOf();

      this.plans = new PlanSettingsCollection(null, {
        rqlQuery: `select(_id)&sort(_id)&_id>${currentPlanTime}`
      });
    },

    getTemplateData: function()
    {
      const what = {
        mrpSettings: false,
        lineGroups: false,
        mrpPriority: false,
        workerCount: true,
        activeTime: true
      };

      if (this.model.settings.getVersion() > 1)
      {
        Object.assign(what, {
          extraCapacity: true,
          linePriority: true,
          orderGroupPriority: true
        });
      }

      what.orderPriority = true;

      return {
        source: this.model.getMoment().format('LL'),
        what
      };
    },

    afterRender: function()
    {
      this.loadTargetPlans();
      this.setUpMrpsSelect2();
    },

    loadTargetPlans: function()
    {
      viewport.msg.loading();

      const $submit = this.$id('submit').prop('disabled', true);
      const $target = this.$id('target').select2({data: []}).select2('enable', false);

      const req = this.plans.fetch();

      req.done(res =>
      {
        viewport.msg.loaded();

        $target.select2({
          width: '100%',
          placeholder: this.t('copySettings:target:placeholder'),
          allowClear: true,
          multiple: true,
          data: (res.collection || [])
            .map(plan =>
            {
              return {
                id: time.format(plan._id, 'YYYY-MM-DD'),
                text: time.format(plan._id, 'LL')
              };
            })
            .filter(item => item.id !== this.model.id)
        });

        $target.select2('enable', true);

        $submit.prop('disabled', false);
      });

      req.fail(() =>
      {
        viewport.msg.loadingFailed();
      });
    },

    setUpMrpsSelect2: function()
    {
      this.$id('mrps').select2({
        width: '100%',
        placeholder: this.t('copySettings:mrps:placeholder'),
        allowClear: true,
        multiple: true,
        data: this.model.settings.mrps.map(mrp =>
        {
          return {
            id: mrp.id,
            text: mrp.id
          };
        }).sort((a, b) => a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true}))
      });

      this.$('input[name="filter"][value="in"]').prop('checked', true);
    },

    submitForm: function()
    {
      const version = this.model.settings.getVersion();
      const what = {};
      const mrps = this.$id('mrps').select2('val');
      let targetPlans = this.$id('target').select2('val');

      this.$('input[name="what[]"]').each(function(i, el)
      {
        if (el.checked)
        {
          what[el.value] = true;
        }
      });

      if (targetPlans.length === 0)
      {
        targetPlans = this.$id('target').data('select2').opts.data.map(item => item.id);
      }

      if (targetPlans.length === 0)
      {
        viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: this.t('copySettings:target:empty')
        });

        return;
      }

      if (_.isEmpty(what))
      {
        viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: this.t('copySettings:what:empty')
        });

        return;
      }

      const data = {
        mrps: {},
        lines: {},
        mrpLines: {}
      };

      mrps.forEach(mrp =>
      {
        const mrpSettings = this.model.settings.mrps.get(mrp);

        data.mrps[mrp] = mrpSettings.pick([
          what.linePriority && version > 1 ? 'linePriority' : null,
          what.lineGroups ? 'groups' : null
        ].concat(!what.mrpSettings ? [] : [
          'limitSmallOrders',
          'extraOrderSeconds',
          'extraShiftSeconds',
          'smallOrderQuantity',
          'bigOrderQuantity',
          'splitOrderQuantity',
          'maxSplitLineCount',
          'hardOrderManHours',
          'hardBigComponents',
          'hardComponents'
        ]));
      });

      this.model.settings.lines.forEach(lineSettings =>
      {
        if (_.intersection(lineSettings.get('mrpPriority'), mrps).length)
        {
          data.lines[lineSettings.id] = lineSettings.pick([
            what.mrpPriority ? 'mrpPriority' : null,
            what.orderPriority && version > 1 ? 'orderPriority' : null,
            what.orderGroupPriority && version > 1 ? 'orderGroupPriority' : null,
            what.workerCount && version > 1 ? 'workerCount' : null,
            what.activeTime ? 'activeTime' : null,
            what.extraCapacity && version > 1 ? 'extraCapacity' : null
          ]);
        }
      });

      if (version === 1)
      {
        this.model.settings.mrps.forEach(mrpSettings =>
        {
          if (!data.mrps[mrpSettings.id])
          {
            return;
          }

          mrpSettings.lines.forEach(mrpLineSettings =>
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
      }

      this.$id('submit')
        .prop('disabled', true)
        .find('.fa-spinner')
        .removeClass('hidden');

      this.copyNext(targetPlans, data);
    },

    copyNext: function(targetPlans, data)
    {
      const targetPlan = targetPlans.shift();

      if (!targetPlan)
      {
        viewport.closeDialog();

        return;
      }

      this.fetchSettings(targetPlan, targetSettings =>
      {
        targetSettings.lines.forEach(lineSettings =>
        {
          Object.assign(lineSettings, data.lines[lineSettings._id]);
        });

        targetSettings.mrps.forEach(mrpSettings =>
        {
          Object.assign(mrpSettings, data.mrps[mrpSettings._id]);

          mrpSettings.lines.forEach(mrpLineSettings =>
          {
            Object.assign(mrpLineSettings, data.mrpLines[mrpSettings._id + ':' + mrpLineSettings._id]);
          });
        });

        this.saveSettings(
          targetPlan,
          targetSettings,
          this.copyNext.bind(this, targetPlans, data)
        );
      });
    },

    fetchSettings: function(targetPlan, done)
    {
      viewport.msg.loading();

      const req = this.ajax({
        url: `/planning/settings/${targetPlan}`
      });

      req.done(targetSettings =>
      {
        viewport.msg.loaded();
        done(targetSettings);
      });

      req.fail(function()
      {
        viewport.msg.loadingFailed();
        this.fail();
      });
    },

    saveSettings: function(targetPlan, targetSettings, done)
    {
      viewport.msg.saving();

      const req = this.ajax({
        method: 'PUT',
        url: `/planning/settings/${targetPlan}`,
        data: JSON.stringify(targetSettings)
      });

      req.done(() =>
      {
        viewport.msg.saved();
        done();
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();
        this.fail();
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
