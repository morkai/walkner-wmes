// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'Sortable',
  'app/viewport',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/core/util/resultTips',
  'app/data/clipboard',
  'app/planning/templates/linesOrderGroupPriorityDialog'
], function(
  _,
  Sortable,
  viewport,
  View,
  idAndLabel,
  resultTips,
  clipboard,
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

      'change input': function()
      {
        viewport.adjustDialogBackdrop();
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
      this.sortables = [];
      this.copyData = [];
    },

    destroy: function()
    {
      this.destroySortables();
    },

    destroySortables: function()
    {
      var view = this;

      view.$('input[data-line-id]').each(function()
      {
        var el = view.$(this);

        el.data('sortable').destroy();
        el.removeData('sortable');
      });
    },

    getTemplateData: function()
    {
      var view = this;

      return {
        lines: view.mrp.getSortedLines().map(function(line)
        {
          return {
            _id: line.id,
            orderGroupPriority: (line.settings.get('orderGroupPriority') || []).join(',')
          };
        })
      };
    },

    afterRender: function()
    {
      var view = this;

      view.$('input[data-line-id]').each(function()
      {
        view.setUpOrderGroupPriority(view.$(this));
      });
    },

    setUpOrderGroupPriority: function($orderGroupPriority)
    {
      var view = this;
      var sortable = $orderGroupPriority.data('sortable');

      if (sortable)
      {
        sortable.destroy();
      }

      $orderGroupPriority.select2({
        allowClear: true,
        multiple: true,
        data: view.orderGroups.map(idAndLabel)
      });

      sortable = new Sortable($orderGroupPriority.select2('container').find('.select2-choices')[0], {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: function()
        {
          $orderGroupPriority.select2('onSortStart');
        },
        onEnd: function()
        {
          $orderGroupPriority.select2('onSortEnd').select2('focus');
        }
      });

      $orderGroupPriority.data('sortable', sortable);
    },

    submitForm: function()
    {
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');

      var settings = view.plan.settings;

      view.$('input[data-line-id]').each(function()
      {
        var line = view.mrp.lines.get(this.dataset.lineId);

        if (!line)
        {
          return;
        }

        var orderGroupPriority = this.value;

        if (orderGroupPriority.length)
        {
          line.settings.set('orderGroupPriority', orderGroupPriority.split(','));
        }
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
          text: view.t('lines:menu:orderGroupPriority:failure')
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
