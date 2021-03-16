// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../DataTableView',
  'app/wmes-osh-reports/templates/engagement/brigades'
], function(
  DataTableView,
  template
) {
  'use strict';

  return DataTableView.extend({

    template,

    dataProperty: 'brigades',

    freezeColumns: 1,

    serializeRows: function()
    {
      const rows = [];
      const userLabels = this.model.get('userLabels') || {};
      const months = this.model.get('months') || [];

      this.model.get('brigades').forEach(brigade =>
      {
        const row = {
          userLabel: userLabels[brigade.id],
          months: months.map(k =>
          {
            const month = brigade.months[k];

            if (!month)
            {
              return {
                members: [],
                active: 0,
                metrics: [0, 0, 0, 0]
              };
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
