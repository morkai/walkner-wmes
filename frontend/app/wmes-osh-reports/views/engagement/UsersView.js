// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../DataTableView',
  'app/wmes-osh-reports/templates/engagement/users'
], function(
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

      this.model.get('users').forEach(user =>
      {
        const row = {
          userLabel: userLabels[user.id],
          months: months.map(k =>
          {
            const month = user.months[k];

            if (!month)
            {
              return [0, 0, 0, 0];
            }

            return month;
          })
        };

        rows.push(row);
      });

      return rows;
    }

  });
});
