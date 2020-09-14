// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/View',
  'app/reports/util/formatXAxis',
  'app/qiResults/templates/outgoingQuality/paretoTable'
], function(
  _,
  time,
  View,
  formatXAxis,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.listenTo(this.model, 'change:groups', this.render);
    },

    getTemplateData: function()
    {
      var view = this;
      var property = view.options.property;
      var rows = [];
      var topCount = view.model.getTopCount();
      var top = view.model.get('top') || {qtyNok: 0};
      var totals = top[property] || [];
      var groups = view.model.get('groups') || [];

      totals.forEach(function(total)
      {
        if (rows.length === topCount)
        {
          return;
        }

        var row = {
          _id: total[0],
          label: total[0],
          title: view.options.resolveTitle ? view.options.resolveTitle(total[0]) : '',
          data: [],
          total: {
            absolute: total[1],
            relative: total[2],
            total: top.qtyNok
          }
        };

        groups.forEach(function(group)
        {
          var match = _.find(group[property], function(d) { return d[0] === row._id; });

          if (match)
          {
            row.data.push({
              absolute: match[1],
              relative: match[2],
              total: group.qtyNok
            });
          }
          else
          {
            row.data.push({
              absolute: 0,
              relative: 0,
              total: group.qtyNok
            });
          }
        });

        if (row.data[row.data.length - 1].absolute)
        {
          row.data = row.data.slice(-3);

          rows.push(row);
        }
      });

      return {
        property: property,
        weeks: groups
          .slice(topCount * -1)
          .map(function(g) { return time.format(g.key, '[W]W'); }),
        rows: rows
      };
    }

  });
});
