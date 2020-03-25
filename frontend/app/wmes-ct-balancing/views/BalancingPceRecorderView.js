// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/decimalSeparator',
  'app/wmes-ct-balancing/BalancingPce',
  'app/wmes-ct-balancing/templates/recorder',
  'css!app/wmes-ct-balancing/assets/recorder'
], function(
  View,
  decimalSeparator,
  BalancingPce,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'dblclick .ct-balancing-recorder-duration': function()
      {
        this.hide();
      },

      'click #-start': function()
      {
        this.model.set({
          startedAt: new Date(),
          finishedAt: null
        });
      },

      'click #-stop': function()
      {
        this.model.set({
          finishedAt: new Date()
        });
      }

    },

    initialize: function()
    {
      this.newOrder = null;
      this.model = new BalancingPce();

      this.listenTo(this.model, 'change:startedAt', this.onStart);
      this.listenTo(this.model, 'change:finishedAt', this.onStop);
    },

    updateOrder: function(order)
    {
      if (this.$el.hasClass('is-started'))
      {
        this.newOrder = order;
      }
      else
      {
        this.model.set('order', order);
      }
    },

    toggle: function(order)
    {
      if (this.$el.hasClass('hidden'))
      {
        this.show(order);
      }
      else
      {
        this.hide();
      }
    },

    show: function(order)
    {
      this.newOrder = null;

      this.model.set({
        order: order,
        line: window.WMES_LINE_ID,
        station: window.WMES_STATION
      });

      this.updateValue();

      this.$el.removeClass('hidden');
    },

    hide: function()
    {
      this.model.set({
        startedAt: null,
        finishedAt: null
      });

      this.$el.addClass('hidden');

      this.stop();
      this.updateValue();
    },

    onStart: function()
    {
      if (this.model.get('startedAt') && !this.model.get('finishedAt'))
      {
        if (this.newOrder)
        {
          this.model.set('order', this.newOrder);
          this.newOrder = null;
        }

        this.start();
      }
    },

    onStop: function()
    {
      if (this.model.get('startedAt') && this.model.get('finishedAt'))
      {
        this.stop();
        this.updateValue();
        this.recordValue();
      }
    },

    start: function()
    {
      this.timers.updateValue = setInterval(this.updateValue.bind(this), 40);

      this.updateValue();

      this.$el.addClass('is-started');
    },

    stop: function()
    {
      this.$el.removeClass('is-started');

      clearInterval(this.timers.updateValue);
      this.timers.updateValue = null;
    },

    updateValue: function()
    {
      var startedAt = this.model.get('startedAt');
      var value = 0;

      if (startedAt)
      {
        value = (Date.now() - startedAt.getTime()) / 1000;
      }

      this.$id('value').text(value.toFixed(1).replace('.', decimalSeparator));
    },

    recordValue: function()
    {
      var view = this;

      view.$id('record')
        .removeClass('btn-danger btn-success btn-warning')
        .addClass('btn-info')
        .find('.fa')
        .removeClass('fa-thumbs-up fa-thumbs-down')
        .addClass('fa-spinner fa-spin');

      view.$el.addClass('is-recording');

      var balancingPce = new BalancingPce(view.model.toJSON());
      var req = balancingPce.save();

      req.fail(function()
      {
        view.$id('record')
          .removeClass('btn-info')
          .addClass('btn-danger')
          .find('.fa')
          .removeClass('fa-spin fa-spinner')
          .addClass('fa-thumbs-down');

        view.timers.restoreActions = setTimeout(view.restoreActions.bind(view), 2000);
      });

      req.done(function()
      {
        view.$id('record')
          .removeClass('btn-info')
          .addClass('btn-success')
          .find('.fa')
          .removeClass('fa-spin fa-spinner')
          .addClass('fa-thumbs-up');

        view.timers.restoreActions = setTimeout(view.restoreActions.bind(view), 1000);
      });
    },

    restoreActions: function()
    {
      this.$el.removeClass('is-recording');
    }

  });
});
