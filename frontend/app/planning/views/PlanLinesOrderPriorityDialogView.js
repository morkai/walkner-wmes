// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'Sortable',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/planning/templates/linesOrderPriorityDialog'
], function(
  _,
  $,
  Sortable,
  t,
  viewport,
  View,
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
      var view = this;

      return {
        idPrefix: view.idPrefix,
        lines: view.mrp.getSortedLines().map(function(line)
        {
          var lineMrpSettings = line.mrpSettings(view.mrp.id);

          return {
            _id: line.id,
            orderPriority: lineMrpSettings ? lineMrpSettings.get('orderPriority').join(',') : ''
          };
        })
      };
    },

    afterRender: function()
    {
      var view = this;

      view.$('input[data-line-id]').each(function()
      {
        view.setUpOrderPriority(view.$(this));
      });
    },

    setUpOrderPriority: function($orderPriority)
    {
      var view = this;

      $orderPriority.select2({
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

      view.sortables.push(new Sortable($orderPriority.select2('container').find('.select2-choices')[0], {
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

      view.$('input[data-line-id]').each(function()
      {
        var line = view.mrp.lines.get(this.dataset.lineId);

        if (!line)
        {
          return;
        }

        var mrpLineSettings = line.mrpSettings(view.mrp.id);
        var orderPriority = this.value;

        if (!mrpLineSettings || !orderPriority.length)
        {
          return;
        }

        if (mrpLineSettings)
        {
          mrpLineSettings.set('orderPriority', orderPriority.split(','));
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
          text: view.t('lines:menu:orderPriority:failure')
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
