// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/wmes-osh-common/dictionaries',
  '../DataTableView',
  'app/wmes-osh-reports/templates/engagement/orgUnits'
], function(
  dictionaries,
  DataTableView,
  template
) {
  'use strict';

  return DataTableView.extend({

    template,

    dataProperty: 'orgUnits',

    freezeColumns: 3,

    serializeRows: function()
    {
      const rows = [];
      const months = this.model.get('months') || [];

      this.model.get('orgUnits').forEach(ou =>
      {
        const row = {
          orgUnit: ou,
          type: ou.department ? 'department' : ou.workplace ? 'workplace' : ou.division ? 'division' : 'overall',
          division: dictionaries.divisions.getLabel(ou.division),
          workplace: dictionaries.workplaces.getLabel(ou.workplace),
          department: dictionaries.departments.getLabel(ou.department),
          months: months.map(k =>
          {
            const month = ou.months[k];

            if (!month)
            {
              return {
                employed: 0,
                engaged: 0,
                engagedPercent: 0,
                minEngaged: 0,
                metrics: [0, 0, 0, 0]
              };
            }

            return {
              employed: month.employed,
              engaged: month.engaged,
              engagedPercent: month.employed ? Math.round(month.engaged / month.employed * 100) : 0,
              minEngaged: month.minEngaged,
              metrics: month.metrics
            };
          })
        };

        rows.push(row);
      });

      rows.sort((a, b) =>
      {
        return a.division.localeCompare(b.division)
          || a.workplace.localeCompare(b.workplace)
          || a.department.localeCompare(b.department);
      });

      return rows;
    }

  });
});
