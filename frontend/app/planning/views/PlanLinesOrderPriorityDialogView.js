// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'Sortable',
  'app/viewport',
  'app/core/View',
  'app/core/util/resultTips',
  'app/planning/templates/linesOrderPriorityDialog'
], function(
  _,
  $,
  Sortable,
  viewport,
  View,
  resultTips,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    modelProperty: 'plan',

    events: {

      'submit': function()
      {
        this.submitForm();

        return false;
      },

      'click a[data-action="copy"]': function(e)
      {
        this.copyData = this.$(e.target).closest('.form-group').find('input').select2('data');

        resultTips.showCopied({e: e});
      },

      'click a[data-action="paste"]': function(e)
      {
        this.$(e.target).closest('.form-group').find('input').select2('data', this.copyData).trigger('change');
      }

    },

    initialize: function()
    {
      this.copyData = [];
    },

    destroy: function()
    {
      this.destroySortables();
    },

    destroySortables: function()
    {
      this.$('input[data-line-id]').each((i, el) =>
      {
        const $el = this.$(el);

        $el.data('sortable').destroy();
        $el.removeData('sortable');
      });
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
            orderPriority: settings ? settings.get('orderPriority').join(',') : ''
          };
        })
      };
    },

    afterRender: function()
    {
      this.$('input[data-line-id]').each((i, el) =>
      {
        this.setUpOrderPriority(this.$(el));
      });
    },

    setUpOrderPriority: function($orderPriority)
    {
      $orderPriority.select2({
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

      let sortable = $orderPriority.data('sortable');

      if (sortable)
      {
        sortable.destroy();
      }

      sortable = new Sortable($orderPriority.select2('container').find('.select2-choices')[0], {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: () =>
        {
          $orderPriority.select2('onSortStart');
        },
        onEnd: () =>
        {
          $orderPriority.select2('onSortEnd').select2('focus');
        }
      });

      $orderPriority.data('sortable', sortable);
    },

    submitForm: function()
    {
      const $submit = this.$id('submit').prop('disabled', true);
      const $spinner = $submit.find('.fa-spinner').removeClass('hidden');
      const settings = this.plan.settings;
      const version = settings.getVersion();

      this.$('input[data-line-id]').each((i, el) =>
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

        const newValue = el.value.split(',').filter(v => !!v);

        lineSettings.set('orderPriority', newValue);
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
