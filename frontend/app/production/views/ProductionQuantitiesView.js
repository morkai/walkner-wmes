// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      this.onKeyDown = this.onKeyDown.bind(this);
      this.editorHiders = [];

      this.listenTo(this.model, 'change:quantitiesDone change:shift locked unlocked', this.render);

      $('body').on('keydown', this.onKeyDown);
    },

    destroy: function()
    {
      $('body').off('keydown', this.onKeyDown);

      this.editorHiders = null;
    },

    serialize: function()
    {
      var currentTime = time.getMoment().valueOf();
      var currentShiftMoment = this.model.getCurrentShiftMoment();
      var unlocked = !this.model.isLocked();

      return {
        quantityRows: (this.model.get('quantitiesDone') || []).map(function(quantity, i)
        {
          var editable = unlocked;
          var time = currentShiftMoment.format('HH:mm:ss');

          currentShiftMoment.add(59, 'minutes').add(59, 'seconds');

          if (i === 7)
          {
            editable = editable && currentTime > (currentShiftMoment.valueOf() - (10 * 60 * 1000));
          }
          else
          {
            editable = editable && currentTime > currentShiftMoment.valueOf();
          }

          time += '-' + currentShiftMoment.format('HH:mm:ss');

          currentShiftMoment.add(1, 'seconds');

          return {
            time: time,
            planned: quantity.planned,
            actual: quantity.actual,
            editable: editable || quantity.actual > 0
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

    onKeyDown: function(e)
    {
      if (e.keyCode === 27)
      {
        this.hideEditors();
      }
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

      if ($td.find('input').length)
      {
        return;
      }

      this.hideEditors();

      var view = this;
      var maxQuantitiesDone = this.model.getMaxQuantitiesDone();
      var $change = $td.find('.btn-link').hide();
      var $value = $td.find('span').hide();
      var oldValue = parseInt($value.text(), 10);
      var $form = $('<form></form>').submit(hideAndSave);
      var $input = $('<input class="form-control" type="number" min="0">')
        .attr('placeholder', t('production', 'quantities:newValuePlaceholder'))
        .attr('max', maxQuantitiesDone)
        .val(oldValue)
        .on('keydown', function(e)
        {
          if (e.which === 27)
          {
            setTimeout(hide, 1);
          }
        })
        .appendTo($form);

      $form.appendTo($td);
      $input.select();

      this.editorHiders.push(hide);

      function hide()
      {
        view.editorHiders.splice(view.editorHiders.indexOf(hide), 1);
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
          $value.text(newValue);

          view.model.changeQuantitiesDone(parseInt(hour, 0), newValue);
        }

        view.$('td[data-hour=' + hour + '] .btn-link').focus();

        return false;
      }
    },

    hideEditors: function()
    {
      this.editorHiders.forEach(function(hide) { hide(); });
      this.editorHiders = [];
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
        currentQuantity: parseInt($td.find('span').text(), 10),
        maxQuantity: this.model.getMaxQuantitiesDone()
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
