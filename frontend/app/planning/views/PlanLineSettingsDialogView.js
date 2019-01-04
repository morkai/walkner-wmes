// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'Sortable',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/planning/templates/lineSettingsDialog'
], function(
  _,
  $,
  Sortable,
  t,
  viewport,
  View,
  setUpMrpSelect2,
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
      this.sortables = [];
    },

    destroy: function()
    {
      this.destroySortables();
    },

    destroySortables: function()
    {
      _.invoke(this.sortables, 'destroy');

      this.sortables = [];
    },

    serialize: function()
    {
      var lineSettings = this.line.settings;
      var mrpLineSettings = this.line.mrpSettings(this.mrp.id);

      return {
        idPrefix: this.idPrefix,
        mrp: this.mrp.getLabel(),
        line: this.line.getLabel(),
        mrpPriority: lineSettings.get('mrpPriority').join(','),
        activeTime: lineSettings.get('activeTime')
          .map(function(activeTime) { return activeTime.from + '-' + activeTime.to; })
          .join(', '),
        workerCount: mrpLineSettings.get('workerCount'),
        orderPriority: mrpLineSettings.get('orderPriority').join(',')
      };
    },

    afterRender: function()
    {
      this.setUpMrpPriority();
      this.setUpOrderPriority();
    },

    setUpMrpPriority: function()
    {
      setUpMrpSelect2(this.$id('mrpPriority'), {
        view: this,
        sortable: true,
        width: '100%',
        placeholder: t('planning', 'settings:mrpPriority:placeholder')
      });
    },

    setUpOrderPriority: function()
    {
      var $orderPriority = this.$id('orderPriority').select2({
        allowClear: true,
        multiple: true,
        data: [
          {id: 'small', text: t('planning', 'orderPriority:small')},
          {id: 'easy', text: t('planning', 'orderPriority:easy')},
          {id: 'hard', text: t('planning', 'orderPriority:hard')}
        ]
      });

      this.sortables.push(new Sortable($orderPriority.select2('container').find('.select2-choices')[0], {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: function()
        {
          $orderPriority.select2('onSortStart');
        },
        onEnd: function()
        {
          $orderPriority.select2('onSortEnd').select2('focus');
        }
      }));
    },

    submitForm: function()
    {
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');

      var settings = view.plan.settings;
      var lineSettings = view.line.settings;

      lineSettings.set({
        mrpPriority: view.$id('mrpPriority').val().split(','),
        activeTime: view.$id('activeTime').val().split(',').map(function(activeTime)
        {
          var parts = activeTime.trim().split('-');

          return {
            from: parts[0],
            to: parts[1]
          };
        }).filter(function(activeTime)
        {
          return !!activeTime.from && !!activeTime.to;
        })
      });

      var newMrpPriority = lineSettings.get('mrpPriority');
      var orderPriority = view.$id('orderPriority').val().split(',');
      var applyToAllMrps = view.$id('applyToAllMrps').prop('checked');
      var workerCount = [1, 2, 3].map(function(shiftNo)
      {
        return Math.max(0, +view.$id('workerCount' + shiftNo).val() || 0);
      });

      newMrpPriority.forEach(function(mrpId)
      {
        var mrpSettings = settings.mrps.get(mrpId);

        if (!mrpSettings)
        {
          mrpSettings = mrpSettings.add({_id: mrpId}).get(mrpId);
        }

        var mrpLineSettings = mrpSettings.lines.get(view.line.id);

        if (!mrpLineSettings)
        {
          mrpLineSettings = mrpSettings.lines.add({_id: view.line.id}).get(view.line.id);
        }

        if (applyToAllMrps || mrpLineSettings.id === view.line.id)
        {
          mrpLineSettings.set({
            workerCount: workerCount,
            orderPriority: orderPriority
          });
        }
      });

      var req = view.plan.settings.save();

      req.done(viewport.closeDialog);
      req.fail(function()
      {
        $spinner.addClass('hidden');
        $submit.prop('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: t('planning', 'lines:menu:remove:failure')
        });

        view.plan.settings.trigger('errored');
      });
    },

    onDialogShown: function()
    {
      this.$id('mrpPriority').select2('focus');
    }

  });
});
