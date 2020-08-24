// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  './QuantityEditorView',
  'app/production/templates/quantities'
], function(
  _,
  $,
  time,
  t,
  viewport,
  View,
  QuantityEditorView,
  quantitiesTemplate
) {
  'use strict';

  return View.extend({

    template: quantitiesTemplate,

    events: {
      'click .production-quantities-actual': 'showQuantityEditor',
      'mousedown .production-quantities-actual': 'showQuantityEditor'
    },

    initialize: function()
    {
      this.onQuantitiesDoneChanged = this.onQuantitiesDoneChanged.bind(this);

      this.listenTo(this.model, 'change:shift locked unlocked', this.render);
      this.listenTo(this.model.settings, 'reset change', function(setting)
      {
        if (!setting || /taktTime/.test(setting.id))
        {
          this.render();
        }
      });
    },

    serialize: function()
    {
      var currentTime = time.getMoment().valueOf();
      var currentShiftMoment = this.model.getCurrentShiftMoment();
      var unlocked = !this.model.isLocked();
      var taktTimeEnabled = this.model.isTaktTimeEnabled();

      return {
        quantityRows: (this.model.get('quantitiesDone') || []).map(function(quantity, i)
        {
          var editable = unlocked;
          var time = currentShiftMoment.format('HH:00');

          currentShiftMoment.add(59, 'minutes').add(59, 'seconds');

          if (i === 7)
          {
            editable = editable && currentTime > (currentShiftMoment.valueOf() - (10 * 60 * 1000));
          }
          else
          {
            editable = editable && currentTime > currentShiftMoment.valueOf();
          }

          time += '-' + currentShiftMoment.add(1, 'seconds').format('HH:00');

          return {
            time: time,
            planned: quantity.planned,
            actual: quantity.actual,
            editable: (editable || quantity.actual > 0) && !taktTimeEnabled
          };
        })
      };
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change:quantitiesDone', this.onQuantitiesDoneChanged);
    },

    afterRender: function()
    {
      this.listenTo(this.model, 'change:quantitiesDone', this.onQuantitiesDoneChanged);

      if (this.timers.nextRender)
      {
        clearTimeout(this.timers.nextRender);
      }

      if (!this.model.isLocked())
      {
        this.scheduleNextRender();
      }

      window.qv = this;
    },

    scheduleNextRender: function()
    {
      var lastShiftHour = this.model.getCurrentShiftMoment().add(7, 'hours').hours();
      var currentMoment = time.getMoment();
      var currentTime = currentMoment.valueOf();
      var currentHour = currentMoment.hours();

      var nextHourTime = currentMoment
        .minutes(0)
        .seconds(0)
        .milliseconds(0)
        .add(1, 'hours')
        .valueOf();

      var nextRenderTime = currentHour === lastShiftHour
        ? (nextHourTime - 10 * 60 * 1000)
        : nextHourTime;

      var delay = nextRenderTime + 1000 - currentTime;

      if (delay > 0)
      {
        this.timers.nextRender = setTimeout(
          function(view)
          {
            view.render();
            view.showEditorDialog();
          },
          delay,
          this
        );
      }
      else
      {
        delete this.timers.nextRender;
      }
    },

    showQuantityEditor: function(e)
    {
      var $td = this.$(e.target).closest('td');

      if ($td.find('input').length
        || this.model.isLocked()
        || this.model.isTaktTimeEnabled())
      {
        return;
      }

      if (this.options.embedded)
      {
        this.showEditorDialog($td);

        return;
      }

      if (!$td.find('.btn-link').length)
      {
        return;
      }

      var view = this;
      var maxQuantitiesDone = this.model.getMaxQuantitiesDone();
      var $change = $td.find('.btn-link').hide();
      var $value = $td.find('span').hide();
      var oldValue = parseInt($value.text(), 10);
      var $form = $('<form></form>').submit(function() { hideAndSave(); return false; });
      var $input = $('<input class="form-control production-quantities-editor" type="number" min="0">')
        .attr({
          placeholder: t('production', 'quantities:newValuePlaceholder'),
          max: maxQuantitiesDone,
          value: oldValue
        })
        .on('keydown', function(e)
        {
          if (e.which === 27)
          {
            _.defer(hide);
          }
        })
        .appendTo($form);

      $form.appendTo($td);

      _.defer(function()
      {
        $input.select().on('blur', function() { _.defer(hideAndSave); });
      });

      function hide()
      {
        $form.remove();
        $change.show();
        $value.show();
      }

      function hideAndSave()
      {
        var newValue = parseInt($input.val(), 10);

        hide();

        var hour = $td.attr('data-hour');

        if (newValue !== oldValue && newValue >= 0 && newValue <= maxQuantitiesDone)
        {
          $value.text(newValue + ' ' + t('production', 'quantities:unit'));

          view.model.changeQuantitiesDone(parseInt(hour, 10), newValue, {render: false});
        }
      }
    },

    showEditorDialog: function($td)
    {
      if (this.model.isTaktTimeEnabled()
        || (viewport.currentDialog && viewport.currentDialog instanceof QuantityEditorView))
      {
        return;
      }

      var $links = this.$('.btn-link');

      if (!$td || !$td.length || !$td.find('.btn-link').length)
      {
        $td = $links.last().closest('td');
      }

      if (!$td.length)
      {
        return;
      }

      var model = {
        hours: [],
        maxQuantity: this.model.getMaxQuantitiesDone(),
        selected: parseInt($td.attr('data-hour'), 10)
      };

      this.$('.production-quantities-actual').each(function()
      {
        var $td = $(this);
        var hours = $td.parent().find('td:first-child').text().trim().split('-');
        var hour = parseInt($td.attr('data-hour'), 10);

        model.hours.push({
          from: hours[0],
          to: hours[1],
          index: hour,
          value: parseInt($td.find('span').text(), 10),
          disabled: $td.find('.btn-link').length === 0
        });
      });

      var quantityEditorView = new QuantityEditorView({
        model: model,
        embedded: this.options.embedded,
        vkb: this.options.vkb
      });

      this.listenTo(quantityEditorView, 'quantityChanged', function(hour, newQuantity)
      {
        viewport.closeDialog();

        if (newQuantity !== null)
        {
          this.model.changeQuantitiesDone(hour, newQuantity, {render: true});
        }
      });

      viewport.closeDialogs(function(dialogView)
      {
        return !(dialogView instanceof QuantityEditorView);
      });

      viewport.showDialog(quantityEditorView, t('production', 'quantityEditor:title'));
    },

    onQuantitiesDoneChanged: function(model, quantitiesDone, options)
    {
      if (options.render !== false)
      {
        this.render();
      }
    }

  });
});
