// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'Sortable',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/planning/templates/lineSettingsDialog'
], function(
  _,
  $,
  Sortable,
  t,
  viewport,
  View,
  idAndLabel,
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
      },

      'change #-orderGroupPriority': function()
      {
        viewport.adjustDialogBackdrop();
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
        version: this.plan.settings.getVersion(),
        mrp: this.mrp.getLabel(),
        line: this.line.getLabel(),
        mrpPriority: lineSettings.get('mrpPriority').join(','),
        orderGroupPriority: (lineSettings.get('orderGroupPriority') || []).join(','),
        activeTime: lineSettings.get('activeTime')
          .map(function(activeTime) { return activeTime.from + '-' + activeTime.to; })
          .join(', '),
        workerCount: mrpLineSettings.get('workerCount'),
        orderPriority: mrpLineSettings.get('orderPriority').join(','),
        extraCapacity: lineSettings.get('extraCapacity') || '0'
      };
    },

    afterRender: function()
    {
      this.setUpMrpPriority();
      this.setUpOrderGroupPriority();
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

    setUpOrderGroupPriority: function()
    {
      var $input = this.$id('orderGroupPriority');

      if (!$input.length)
      {
        return;
      }

      $input.select2({
        allowClear: true,
        multiple: true,
        data: this.orderGroups.map(idAndLabel)
      });

      this.sortables.push(new Sortable($input.select2('container').find('.select2-choices')[0], {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: () =>
        {
          $input.select2('onSortStart');
        },
        onEnd: () =>
        {
          $input.select2('onSortEnd').select2('focus');
        }
      }));
    },

    setUpOrderPriority: function()
    {
      var view = this;
      var $input = view.$id('orderPriority').select2({
        allowClear: true,
        multiple: true,
        data: view.plan.settings.getAvailableOrderPriorities().map(function(id)
        {
          return {
            id: id,
            text: view.t('orderPriority:' + id)
          };
        })
      });

      view.sortables.push(new Sortable($input.select2('container').find('.select2-choices')[0], {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: function()
        {
          $input.select2('onSortStart');
        },
        onEnd: function()
        {
          $input.select2('onSortEnd').select2('focus');
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
      var extraCapacity = this.$id('extraCapacity').val().trim() || '0';

      if (extraCapacity === '0%')
      {
        extraCapacity = '0';
      }

      lineSettings.set({
        mrpPriority: view.$id('mrpPriority').val().split(','),
        orderGroupPriority: (view.$id('orderGroupPriority').val() || '').split(',').filter(v => !!v),
        activeTime: view.$id('activeTime')
          .val()
          .split(',')
          .map(activeTime =>
          {
            var parts = activeTime.trim().split('-');

            return {
              from: parts[0],
              to: parts[1]
            };
          })
          .filter(activeTime => !!activeTime.from && !!activeTime.to),
        extraCapacity
      });

      var newMrpPriority = lineSettings.get('mrpPriority');
      var orderPriority = view.$id('orderPriority').val().split(',');
      var applyToAllMrps = view.$id('applyToAllMrps').prop('checked');
      var workerCount = [1, 2, 3].map(shiftNo => Math.max(0, +view.$id(`workerCount${shiftNo}`).val() || 0));

      newMrpPriority.forEach(mrpId =>
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

      viewport.msg.saving();

      var req = view.plan.settings.save();

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
