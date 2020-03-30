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

    modelProperty: 'plan',

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

      this.listenTo(this.plan.settings, 'changed', this.onSettingsChanged);
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

    getTemplateData: function()
    {
      var lineSettings = this.line.settings;
      var mrpLineSettings = this.line.mrpSettings(this.mrp.id);

      return {
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
      var view = this;

      setUpMrpSelect2(view.$id('mrpPriority'), {
        view: view,
        sortable: true,
        width: '100%',
        placeholder: view.t('settings:mrpPriority:placeholder'),
        itemDecorator: function(item)
        {
          item.disabled = view.plan.settings.isMrpLocked(item.id);
          item.locked = item.disabled;

          if (item.locked)
          {
            item.icon = {id: 'fa-lock', color: '#e00'};
          }

          return item;
        }
      });
    },

    setUpOrderPriority: function()
    {
      var $orderPriority = this.$id('orderPriority').select2({
        allowClear: true,
        multiple: true,
        data: [
          {id: 'small', text: this.t('orderPriority:small')},
          {id: 'easy', text: this.t('orderPriority:easy')},
          {id: 'hard', text: this.t('orderPriority:hard')}
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
          mrpSettings = settings.mrps.add({_id: mrpId}).get(mrpId);
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
          text: view.t('lines:menu:remove:failure')
        });

        view.plan.settings.trigger('errored');
      });
    },

    onDialogShown: function()
    {
      this.$id('mrpPriority').select2('focus');
    },

    onSettingsChanged: function(changes)
    {
      if (!changes.locked)
      {
        return;
      }

      var view = this;
      var $mrpPriority = view.$id('mrpPriority');
      var oldMrpPriority = view.line.settings.get('mrpPriority');
      var newMrpPriority = $mrpPriority
        .val()
        .split(',')
        .filter(function(mrp)
        {
          return mrp.length > 0 && (_.includes(oldMrpPriority, mrp) || !view.plan.settings.isMrpLocked(mrp));
        });

      $mrpPriority.select('destroy').val(newMrpPriority.join(','));

      this.setUpMrpPriority();
    }

  });
});
