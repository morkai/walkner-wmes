// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/pressWorksheets/PressWorksheet',
  'app/pressWorksheets/templates/ordersList',
  'app/reports/templates/4/notesList'
], function(
  t,
  time,
  View,
  PressWorksheet,
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

        var notes = this.model.get('notes');

        var req = this.ajax({
          type: 'POST',
          url: '/reports/4;notes?' + this.model.query.serializeToString(),
          data: JSON.stringify({
            worksheets: notes.worksheets,
            orders: notes.orders
          })
        });

        req.fail(function()
        {
          $icon.removeClass('fa-spin');
          $load.prop('disabled', false);
        });

        req.done(function(res)
        {
          view.orders = PressWorksheet.serializeOrders(res.collection);

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
      this.listenTo(this.model, 'request error change:notes', this.render);
    },

    getTemplateData: function()
    {
      var notes = this.model.get('notes');

      return {
        orders: this.orders,
        notes: notes.count,
        worksheets: notes.worksheets.length,
        renderOrderList: renderOrdersList
      };
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
