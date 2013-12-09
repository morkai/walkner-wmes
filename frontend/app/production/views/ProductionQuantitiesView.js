define([
  'jquery',
  'app/time',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  './QuantityEditorView',
  'app/production/templates/quantities'
], function(
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
      'click .production-quantities-actual .btn-link': 'showQuantityEditor'
    },

    initialize: function()
    {
      this.listenTo(this.model, 'change:quantitiesDone change:shift locked unlocked', this.render);
    },

    serialize: function()
    {
      var currentTime = time.getServerMoment().valueOf();
      var currentShiftMoment = this.model.getCurrentShiftMoment();
      var unlocked = !this.model.isLocked();

      return {
        quantityRows: (this.model.get('quantitiesDone') || []).map(function(quantity, i)
        {
          var editable = unlocked;
          var time = currentShiftMoment.format('HH:mm:ss');

          currentShiftMoment.add('minutes', 59).add('seconds', 59);

          if (i === 7)
          {
            editable = editable && currentTime > (currentShiftMoment.valueOf() - (10 * 60 * 1000));
          }
          else
          {
            editable = editable && currentTime > currentShiftMoment.valueOf();
          }

          time += '-' + currentShiftMoment.format('HH:mm:ss');

          currentShiftMoment.add('seconds', 1);

          return {
            time: time,
            planned: quantity.planned,
            actual: quantity.actual,
            editable: editable
          };
        })
      };
    },

    afterRender: function()
    {
      if (this.timers.nextRender)
      {
        clearTimeout(this.timers.nextRender);
      }

      if (!this.model.isLocked())
      {
        this.scheduleNextRender();
      }
    },

    scheduleNextRender: function()
    {
      var lastShiftHour = this.model.getCurrentShiftMoment().add('hours', 7).hours();
      var currentMoment = time.getServerMoment();
      var currentHour = currentMoment.hours();

      var nextHourTime = currentMoment
        .minutes(0)
        .seconds(0)
        .milliseconds(0)
        .add('hours', 1)
        .valueOf();

      var nextRenderTime = currentHour === lastShiftHour
        ? (nextHourTime - 10 * 60 * 1000)
        : nextHourTime;

      var delay = nextRenderTime + 1000 - Date.now();

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

      if ($td.find('input').length)
      {
        return;
      }

      var view = this;
      var $change = $td.find('.btn-link').hide();
      var $value = $td.find('span').hide();
      var oldValue = parseInt($value.text(), 10);
      var $input = $('<input class="form-control" type="number" min="0">')
        .attr('placeholder', t('production', 'quantities:newValuePlaceholder'))
        .val(oldValue)
        .on('blur', hideAndSave)
        .on('keydown', function(e)
        {
          if (e.which === 27)
          {
            setTimeout(hide, 1);
          }
          else if (e.which === 13)
          {
            setTimeout(hideAndSave, 1);
          }
        })
        .appendTo($td)
        .select();

      function hide()
      {
        $input.remove();
        $change.show();
        $value.show();
      }

      function hideAndSave()
      {
        var newValue = parseInt($input.val(), 10);

        hide();

        var hour = $td.attr('data-hour');

        if (newValue !== oldValue && newValue >= 0)
        {
          $value.text(newValue);

          view.model.changeQuantitiesDone(parseInt(hour, 0), newValue);
        }

        view.$('td[data-hour=' + hour + '] .btn-link').focus();
      }
    },

    showEditorDialog: function($td)
    {
      if (!$td)
      {
        $td = this.$('.btn-link').last().closest('td');
      }

      var hours = $td.parent().find('td:first-child').text().trim().split('-');
      var hour = parseInt($td.attr('data-hour'), 10);
      var options = {
        from: hours[0],
        to: hours[1],
        currentQuantity: parseInt($td.find('span').text(), 10)
      };

      var quantityEditorView = new QuantityEditorView(options);

      this.listenTo(quantityEditorView, 'quantityChanged', function(newQuantity)
      {
        viewport.closeDialog();

        if (newQuantity !== null)
        {
          this.model.changeQuantitiesDone(hour, newQuantity);
        }
      });

      viewport.showDialog(quantityEditorView, t('production', 'quantityEditor:title'));
    }

  });
});
