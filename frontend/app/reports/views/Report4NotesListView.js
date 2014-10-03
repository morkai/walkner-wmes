// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/pressWorksheets/templates/ordersList',
  'app/reports/templates/notesList'
], function(
  t,
  time,
  View,
  renderOrdersList,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    className: 'reports-4-notesList',

    events: {
      'click #-load': function()
      {
        var view = this;
        var $load = this.$id('load').prop('disabled', true);
        var $icon = $load.find('.fa');

        $icon.addClass('fa-spin');

        var req = this.ajax({
          type: 'GET',
          url: '/reports/4;notes?' + this.model.query.serializeToString()
        });

        req.fail(function()
        {
          $icon.removeClass('fa-spin');
          $load.prop('disabled', false);
        });

        req.done(function(res)
        {
          view.orders = res.collection.map(function(order)
          {
            if (order.startedAt.length !== 5)
            {
              order.startedAt = time.format(order.startedAt, 'HH:mm:ss');
              order.finishedAt = time.format(order.finishedAt, 'HH:mm:ss');
            }

            return order;
          });

          view.render();
        });
      },
      'click .panel-heading': 'togglePanel',
      'mouseover tbody > tr': function(e)
      {
        this.toggleHovered(e.currentTarget, true);
      },
      'mouseout tbody > tr': function(e)
      {
        this.toggleHovered(e.currentTarget, false);
      }
    },

    initialize: function()
    {
      this.orders = [];

      this.listenTo(this.model, 'request', function()
      {
        this.orders = [];
      });
    },

    serialize: function()
    {
      var notes = this.model.get('notes');

      return {
        idPrefix: this.idPrefix,
        orders: this.orders,
        notes: notes.count,
        worksheets: notes.worksheets.length,
        renderOrderList: renderOrdersList
      };
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'request error change:notes', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'request error change:notes', this.render);
    },

    toggleHovered: function(rowEl, hovered)
    {
      var $row = this.$(rowEl);
      var $relatedRow = $row.hasClass('pressWorksheets-orders-notes')
        ? $row.prev()
        : $row.next('.pressWorksheets-orders-notes');

      $row.toggleClass('is-hovered', hovered);
      $relatedRow.toggleClass('is-hovered', hovered);
    },

    togglePanel: function()
    {
      var $toggle = this.$id('toggle');
      var $icon = $toggle.find('.fa');
      var $table = this.$id('table');

      $table.stop(true);

      if ($icon.hasClass('fa-chevron-up'))
      {
        $icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
        $table.slideUp('fast');
      }
      else
      {
        $icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
        $table.slideDown('fast');
      }
    }

  });
});
