// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/planning/templates/linesWorkerCountDialog'
], function(
  _,
  $,
  t,
  viewport,
  View,
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

    getTemplateData: function()
    {
      const version = this.plan.settings.getVersion();

      return {
        lines: this.mrp.getSortedLines().map(line =>
        {
          const settings = (version === 1 ? line.mrpSettings(this.mrp.id) : line.settings);

          return {
            _id: line.id,
            workerCount: settings ? settings.get('workerCount') : [0, 0, 0]
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

        var workerCount = this.$(el)
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
