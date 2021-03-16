// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/wmes-osh-common/dictionaries',
  '../DataTableView',
  'app/wmes-osh-reports/templates/observers/orgUnits'
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
      const empty = {
        employed: 0,
        observers: 0,
        observersPercent: 0,
        engaged: 0,
        engagedPercent: 0,
        cardsPercent: 0,
        safePercent: 0,
        targets: {},
        metrics: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };

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
              return empty;
            }

            return {
              employed: month.employed,
              observers: month.observers,
              observersPercent: month.employed ? Math.round(month.observers / month.employed * 100) : 0,
              engaged: month.engaged,
              engagedPercent: month.observers ? Math.round(month.engaged / month.observers * 100) : 0,
              cardsPercent: month.employed ? Math.round(month.metrics[0] / month.employed * 100) : 0,
              safePercent: month.metrics[1] ? Math.round(month.metrics[3] / month.metrics[1] * 100) : 0,
              targets: month.targets,
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
