// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/resultTips',
  'app/planning/templates/linesWorkerCountDialog'
], function(
  _,
  $,
  t,
  viewport,
  View,
  resultTips,
  template
) {
  'use strict';

  return View.extend({

    template,

    modelProperty: 'plan',

    events: {

      'submit': function()
      {
        this.submitForm();

        return false;
      },

      'blur input[type="number"]': function(e)
      {
        if (e.target.value === '0')
        {
          e.target.value = '';
        }
      },

      'click a[data-action="copy"]': function(e)
      {
        this.copyData = this.$(e.target).closest('.form-group').find('input').map((i, el) => el.value).get();

        resultTips.showCopied({e: e});
      },

      'click a[data-action="paste"]': function(e)
      {
        this.$(e.target).closest('.form-group').find('input').each((i, el) => el.value = this.copyData[i]);
      },

      'click a[data-action="zero"]': function(e)
      {
        this.$(e.target).closest('.form-group').find('input').each((i, el) => el.value = '');
      }

    },

    initialize: function()
    {
      this.copyData = ['', '', ''];
    },

    getTemplateData: function()
    {
      const version = this.plan.settings.getVersion();

      return {
        lines: this.mrp.getSortedLines().map(line =>
        {
          const settings = (version === 1 ? line.mrpSettings(this.mrp.id) : line.settings);

          return {
            _id: line.id,
            workerCount: settings ? settings.get('workerCount') : ['', '', '']
          };
        })
      };
    },

    submitForm: function()
    {
      const $submit = this.$id('submit').prop('disabled', true);
      const $spinner = $submit.find('.fa-spinner').removeClass('hidden');

      const settings = this.plan.settings;
      const version = settings.getVersion();

      this.$('[data-line-id]').each((i, el) =>
      {
        const line = this.mrp.lines.get(el.dataset.lineId);

        if (!line)
        {
          return;
        }

        const lineSettings = version === 1 ? line.mrpSettings(this.mrp.id) : line.settings;

        if (!lineSettings)
        {
          return;
        }

        const workerCount = this.$(el)
          .find('[data-shift-no]')
          .map((i, el) => Math.max(0, +parseFloat(el.value).toFixed(2) || 0))
          .get();

        lineSettings.set('workerCount', workerCount);
      });

      viewport.msg.saving();

      const req = settings.save();

      req.done(() =>
      {
        viewport.msg.saved();
        viewport.closeDialog();
      });

      req.fail(() =>
      {
        $spinner.addClass('hidden');
        $submit.prop('disabled', false);

        viewport.msg.savingFailed();

        this.plan.settings.trigger('errored');
      });
    },

    onDialogShown: function()
    {
      this.$id('line').select2('focus');
    }

  });
});
