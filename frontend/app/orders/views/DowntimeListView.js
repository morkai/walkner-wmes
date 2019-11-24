// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  'app/prodDowntimes/views/ProdDowntimeListView',
  'app/orders/templates/downtimeList',
  'i18n!app/nls/prodDowntimes'
], function(
  time,
  View,
  ProdDowntimeListView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.insertView('.orders-downtimes', new ProdDowntimeListView({
        collection: this.collection,
        simple: true,
        shiftColumn: true
      }));

      this.listenTo(this.collection, 'reset change', this.updateTotals);
    },

    afterRender: function()
    {
      this.updateTotals();
    },

    updateTotals: function()
    {
      var totals = [];
      var lines = {};
      var now = Date.now();

      this.collection.forEach(function(dt)
      {
        var line = dt.get('prodLine');
        var startedAt = Date.parse(dt.get('startedAt'));
        var finishedAt = Date.parse(dt.get('finishedAt')) || now;
        var duration = finishedAt - startedAt;

        if (!lines[line])
        {
          lines[line] = 0;
        }

        lines[line] += duration;
      });

      Object.keys(lines).forEach(function(line)
      {
        totals.push(line + ': ' + time.toString(lines[line] / 1000));
      });

      this.$id('totals').text(totals.join(' | '));
    }

  });
});
