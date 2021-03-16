// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/wmes-osh-common/dictionaries',
  '../DataTableView',
  'app/wmes-osh-reports/templates/observers/users'
], function(
  dictionaries,
  DataTableView,
  template
) {
  'use strict';

  return DataTableView.extend({

    template,

    dataProperty: 'users',

    freezeColumns: 1,

    serializeRows: function()
    {
      const rows = [];
      const userLabels = this.model.get('userLabels') || {};
      const months = this.model.get('months') || [];
      const empty = {
        safePercent: 0,
        metrics: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };

      this.model.get('users').forEach(user =>
      {
        const row = {
          userLabel: userLabels[user.id],
          months: months.map(k =>
          {
            const month = user.months[k];

            if (!month)
            {
              return empty;
            }

            return {
              safePercent: month.metrics[1] ? Math.round(month.metrics[3] / month.metrics[1] * 100) : 0,
              metrics: month.metrics
            };
          })
        };

        rows.push(row);
      });

      return rows;
    }

  });
});
