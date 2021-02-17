// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/View',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-departments/Department',
  'app/wmes-osh-reports/util/formatPercent',
  'app/wmes-osh-reports/templates/observers/orgUnits',
  'jquery.stickytableheaders'
], function(
  $,
  View,
  dictionaries,
  Department,
  formatPercent,
  template
) {
  'use strict';

  return View.extend({

    template,

    initialize: function()
    {
      this.listenTo(this.model, `change:orgUnits`, this.render);

      this.setUpTooltips();
      this.setUpStickyTable();
    },

    getTemplateData: function()
    {
      return {
        rows: this.serializeRows(),
        n: n => n >= 0 ? (Math.round(n * 100) / 100).toLocaleString() : ''
      };
    },

    setUpTooltips: function()
    {
      this.on('afterRender', () =>
      {
        this.$el.tooltip({
          container: document.body,
          selector: 'th[title]'
        });
      });

      this.on('beforeRender remove', () =>
      {
        this.$el.tooltip('destroy');
      });
    },

    setUpStickyTable: function()
    {
      this.on('afterRender', () =>
      {
        this.$('.table').stickyTableHeaders({
          fixedOffset: $('.navbar-fixed-top'),
          scrollableAreaX: this.$el
        });
      });

      this.on('beforeRender remove', () =>
      {
        this.$('.table').stickyTableHeaders('destroy');
      });
    },

    serializeRows: function()
    {
      const totalRow = this.createRow('total');
      const divisions = {};
      const workplaces = {};
      const rows = [];
      const unknownDepartment = new Department({_id: 0, longName: '?'});

      this.model.get('orgUnits').forEach(d =>
      {
        const department = dictionaries.departments.get(d.department) || unknownDepartment;
        const workplace = department ? dictionaries.workplaces.get(department.get('workplace')) : null;
        const division = workplace ? dictionaries.divisions.get(workplace.get('division')) : null;

        if (division)
        {
          if (!divisions[division.id])
          {
            const divisionRow = this.createRow('division', division, null, null, d);

            divisions[division.id] = divisionRow;

            rows.push(divisionRow);
          }
          else
          {
            this.incRow(divisions[division.id], d);
          }

          divisions[division.id].children += 1;
        }

        if (workplace)
        {
          if (!workplaces[workplace.id])
          {
            const workplaceRow = this.createRow('workplace', division, workplace, null, d);

            workplaces[workplace.id] = workplaceRow;

            rows.push(workplaceRow);

            if (division)
            {
              divisions[division.id].children += 1;
            }
          }
          else
          {
            this.incRow(workplaces[workplace.id], d);
          }

          workplaces[workplace.id].children += 1;
        }

        const rowType = department === unknownDepartment ? 'unknown' : 'department';
        const departmentRow = this.createRow(rowType, division, workplace, department, d);

        rows.push(this.summarizeRow(departmentRow));

        this.incRow(totalRow, d);
      });

      Object.values(divisions).forEach(this.summarizeRow, this);
      Object.values(workplaces).forEach(this.summarizeRow, this);

      rows.sort((a, b) =>
      {
        return a.division.localeCompare(b.division)
          || a.workplace.localeCompare(b.workplace)
          || a.department.localeCompare(b.department);
      });

      rows.push(this.summarizeRow(totalRow));

      return rows;
    },

    createRow: function(type, division, workplace, department, d = {})
    {
      return {
        type,
        children: 1,
        division: division ? division.getLabel({long: false}) : '',
        workplace: workplace ? workplace.getLabel({long: false}) : '',
        department: department ? department.getLabel() : '',
        employees: d.employees || 0,
        observers: d.observers || 0,
        observersPercent: 0,
        observersInvalid: false,
        minObservers: division ? division.get('minObservers') : 0,
        safePercent: 0,
        safeInvalid: false,
        easyPercent: 0,
        cardsPercent: 0,
        cardsInvalid: false,
        metrics: d.metrics || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };
    },

    incRow: function(row, d)
    {
      row.employees += d.employees;
      row.observers += d.observers;

      d.metrics.forEach((value, i) =>
      {
        row.metrics[i] += value;
      });
    },

    summarizeRow: function(row)
    {
      const {
        minSafeObs,
        maxSafeObs,
        obsCardsPerDepartment,
        observersPerDepartment
      } = this.model.get('settings');

      const minObservers = row.minObservers || observersPerDepartment;

      row.observersPercent = formatPercent(row.observers / row.employees);
      row.observersInvalid = row.observersPercent >= 0 && row.observersPercent < minObservers;
      row.cardsPercent = formatPercent(row.metrics[0] / row.employees);
      row.cardsInvalid = row.cardsPercent >= 0 && row.cardsPercent < obsCardsPerDepartment;
      row.safePercent = formatPercent(row.metrics[3] / row.metrics[1]);
      row.safeInvalid = row.safePercent < minSafeObs || row.safePercent > maxSafeObs;
      row.easyPercent = formatPercent((row.metrics[6] + row.metrics[9]) / (row.metrics[5] + row.metrics[8]));

      return row;
    }

  });
});
