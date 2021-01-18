// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/View',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-departments/Department',
  'app/wmes-osh-reports/templates/engagement/orgUnits',
  'jquery.stickytableheaders'
], function(
  $,
  View,
  dictionaries,
  Department,
  template
) {
  'use strict';

  return View.extend({

    template,

    initialize: function()
    {
      this.listenTo(this.model, `change:orgUnits`, this.render);
    },

    destroy: function()
    {
      this.$('.table').stickyTableHeaders('destroy');
    },

    getTemplateData: function()
    {
      return {
        rows: this.serializeRows(),
        n: n => n >= 0 ? (Math.round(n * 100) / 100).toLocaleString() : ''
      };
    },

    afterRender: function()
    {
      this.$('.table').stickyTableHeaders({fixedOffset: $('.navbar-fixed-top')});
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
            const divisionRow = this.createRow('division', division);

            divisions[division.id] = divisionRow;

            rows.push(divisionRow);
          }

          this.incRow(divisions[division.id], d);

          divisions[division.id].children += 1;
        }

        if (workplace)
        {
          if (!workplaces[workplace.id])
          {
            const workplaceRow = this.createRow('workplace', division, workplace);

            workplaces[workplace.id] = workplaceRow;

            rows.push(workplaceRow);

            if (division)
            {
              divisions[division.id].children += 1;
            }
          }

          this.incRow(workplaces[workplace.id], d);

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

    createRow: function(type, division, workplace, department, d)
    {
      if (!d)
      {
        d = {
          employed: 0,
          engaged: 0,
          metrics: [0, 0, 0, 0]
        };
      }

      return {
        type,
        children: 1,
        division: division ? division.getLabel({long: false}) : '',
        workplace: workplace ? workplace.getLabel({long: false}) : '',
        department: department ? department.getLabel({long: true}) : '',
        employed: d.employed,
        engaged: d.engaged,
        engagedPercent: 0,
        metrics: d.metrics
      };
    },

    incRow: function(row, d)
    {
      row.employed += d.employed;
      row.engaged += d.engaged;

      d.metrics.forEach((value, i) =>
      {
        row.metrics[i] += value;
      });
    },

    summarizeRow: function(row)
    {
      const {minEngagement} = this.model.get('settings');

      row.engagedPercent = Math.round(row.engaged / row.employed * 100);

      if (!isFinite(row.engagedPercent))
      {
        row.engagedPercent = -1;
      }

      row.engagedInvalid = row.engagedPercent >= 0 && row.engagedPercent < minEngagement;

      return row;
    }

  });
});
