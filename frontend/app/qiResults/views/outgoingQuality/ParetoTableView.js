// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/reports/util/formatXAxis',
  'app/qiResults/templates/outgoingQuality/paretoTable'
], function(
  _,
  View,
  formatXAxis,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.listenTo(this.model, 'change:' + this.options.property, this.render);
    },

    getTemplateData: function()
    {
      var view = this;
      var property = view.options.property;
      var rows = [];
      var totals = view.model.get(property) || [];
      var groups = view.model.get('groups') || [];
      var maxRows = view.options.maxRows || 3;

      for (var i = 0; i < maxRows; ++i)
      {
        var total = totals[i];

        if (!total)
        {
          break;
        }

        var row = {
          _id: total[0],
          label: total[0],
          title: view.options.resolveTitle ? view.options.resolveTitle(total[0]) : '',
          data: [],
          total: total[2]
        };

        for (var g = 0; g < groups.length; ++g)
        {
          var match = _.find(groups[g][property], function(d) { return d[0] === row._id; }); // eslint-disable-line no-loop-func

          if (match)
          {
            row.data.push(match[2]);
          }
          else
          {
            row.data.push(0);
          }
        }

        rows.push(row);
      }

      return {
        property: property,
        weeks: groups.map(function(g) { return formatXAxis(view, {value: g.key}); }),
        rows: rows
      };
    }

  });
});
