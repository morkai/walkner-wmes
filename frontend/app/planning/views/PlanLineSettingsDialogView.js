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
      },

      'change #-activeTime': function()
      {
        const $activeTime = this.$id('activeTime');
        const value = $activeTime
          .val()
          .trim()
          .split(/[\s,]+/)
          .map(word =>
          {
            const parts = word.trim().split('-');
            const from = parts[0].split(':');
            const to = (parts[1] || '0').split(':');
            const fromH = (parseInt(from[0], 10) || 0).toString().padStart(2, '0');
            const fromM = (parseInt(from[1], 10) || 0).toString().padStart(2, '0');
            const toH = (parseInt(to[0], 10) || 0).toString().padStart(2, '0');
            const toM = (parseInt(to[1], 10) || 0).toString().padStart(2, '0');

            return `${fromH}:${fromM}-${toH}:${toM}`;
          })
          .filter(v => v !== '00:00-00:00' && v !== '06:00-06:00')
          .join(', ');

        $activeTime.val(value);
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
      const version = this.plan.settings.getVersion();
      const lineSettings = this.line.settings;
      const mrpLineSettings = this.line.mrpSettings(this.mrp.id);

      return {
        version,
        mrp: this.mrp.getLabel(),
        line: this.line.getLabel(),
        mrpPriority: lineSettings.get('mrpPriority').join(','),
        orderGroupPriority: (lineSettings.get('orderGroupPriority') || []).join(','),
        activeTime: lineSettings.get('activeTime')
          .map(activeTime => `${activeTime.from}-${activeTime.to}`)
          .join(', '),
        workerCount: (version === 1 ? mrpLineSettings : lineSettings).get('workerCount'),
        orderPriority: (version === 1 ? mrpLineSettings : lineSettings).get('orderPriority').join(','),
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
      setUpMrpSelect2(this.$id('mrpPriority'), {
        view: this,
        sortable: true,
        width: '100%',
        placeholder: this.t('settings:mrpPriority:placeholder'),
        itemDecorator: item =>
        {
          item.disabled = this.plan.settings.isMrpLocked(item.id);
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
      var $input = this.$id('orderPriority').select2({
        allowClear: true,
        multiple: true,
        data: this.plan.settings.getAvailableOrderPriorities().map(id =>
        {
          return {
            id: id,
            text: this.t(`orderPriority:${id}`)
          };
        })
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

    submitForm: function()
    {
      const $submit = this.$id('submit').prop('disabled', true);
      const $spinner = $submit.find('.fa-spinner').removeClass('hidden');

      const settings = this.plan.settings;
      const lineSettings = this.line.settings;
      const version = settings.getVersion();

      const mrpPriority = this.$id('mrpPriority').val().split(',');
      const orderPriority = this.$id('orderPriority').val().split(',');
      const workerCount = [1, 2, 3].map(shiftNo => Math.max(0, +this.$id(`workerCount${shiftNo}`).val() || 0));
      let extraCapacity = this.$id('extraCapacity').val().trim();

      if (!extraCapacity || extraCapacity === '0' || extraCapacity === '0%')
      {
        extraCapacity = '0';
      }

      lineSettings.set({
        mrpPriority,
        orderGroupPriority: (this.$id('orderGroupPriority').val() || '').split(',').filter(v => !!v),
        activeTime: this.$id('activeTime').val().split(',').map(activeTime =>
        {
          const parts = activeTime.trim().split('-');

          return {
            from: parts[0],
            to: parts[1]
          };
        }).filter(v => !!v.to),
        extraCapacity
      });

      if (version > 1)
      {
        lineSettings.set({
          workerCount,
          orderPriority
        });
      }

      const applyToAllMrps = !!this.$id('applyToAllMrps').prop('checked');

      mrpPriority.forEach(mrpId =>
      {
        let mrpSettings = settings.mrps.get(mrpId);

        if (!mrpSettings)
        {
          mrpSettings = settings.mrps.add({_id: mrpId}).get(mrpId);
        }

        let mrpLineSettings = mrpSettings.lines.get(this.line.id);

        if (!mrpLineSettings)
        {
          mrpLineSettings = mrpSettings.lines.add({_id: this.line.id}).get(this.line.id);
        }

        if (applyToAllMrps || mrpLineSettings.id === this.line.id)
        {
          mrpLineSettings.set({
            workerCount: version === 1 ? workerCount : [0, 0, 0],
            orderPriority: version === 1 ? orderPriority : []
          });
        }
      });

      viewport.msg.saving();

      const req = this.plan.settings.save();

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
