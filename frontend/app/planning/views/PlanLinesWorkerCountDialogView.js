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

    serialize: function()
    {
      var view = this;

      return {
        idPrefix: view.idPrefix,
        lines: view.mrp.lines.map(function(line)
        {
          var lineMrpSettings = line.mrpSettings(view.mrp.id);

          return {
            _id: line.id,
            workerCount: lineMrpSettings ? lineMrpSettings.get('workerCount') : [0, 0, 0]
          };
        })
      };
    },

    submitForm: function()
    {
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');

      var settings = view.plan.settings;

      view.$('[data-line-id]').each(function()
      {
        var line = view.mrp.lines.get(this.dataset.lineId);

        if (!line)
        {
          return;
        }

        var mrpLineSettings = line.mrpSettings(view.mrp.id);

        if (!mrpLineSettings)
        {
          return;
        }

        mrpLineSettings.set('workerCount', view.$(this).find('[data-shift-no]').map(function()
        {
          return Math.max(0, parseInt(this.value, 10) || 0);
        }).get());
      });

      var req = settings.save();

      req.done(viewport.closeDialog);
      req.fail(function()
      {
        $spinner.addClass('hidden');
        $submit.prop('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: t('planning', 'lines:menu:workerCount:failure')
        });

        view.plan.settings.trigger('errored');
      });
    },

    onDialogShown: function()
    {
      this.$id('line').select2('focus');
    }

  });
});
