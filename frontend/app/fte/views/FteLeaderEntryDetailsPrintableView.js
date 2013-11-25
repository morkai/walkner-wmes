define([
  'app/i18n',
  'app/core/views/PrintableListView',
  'i18n!app/nls/fte'
], function(
  t,
  PrintableListView
) {
  'use strict';

  return PrintableListView.extend({

    className: 'fte-leaderEntry-print',

    initialize: function()
    {
      PrintableListView.prototype.initialize.apply(this, arguments);

      this.totalsByCompany = {};
    },

    serializeColumns: function()
    {
      var columns = [
        {id: 'task', label: t('fte', 'leaderEntry:column:task')},
        {id: 'total', label: t('fte', 'leaderEntry:column:taskTotal')}
      ];
      var totalsByCompany = this.totalsByCompany;

      this.model.serializeCompanies().forEach(function(company)
      {
        columns.push({
          id: company._id,
          label: company.name
        });

        totalsByCompany[company._id] = company.total;
      });

      return columns;
    },

    serializeRows: function()
    {
      var rows = [];
      var totalRow = {
        className: 'fte-leaderEntry-print-total',
        task: t('fte', 'leaderEntry:column:companyTotal'),
        total: 0
      };
      var totalsByCompany = this.totalsByCompany;

      Object.keys(totalsByCompany).forEach(function(companyId)
      {
        totalRow.total += totalsByCompany[companyId];
        totalRow[companyId] = totalsByCompany[companyId];
      });

      rows.push(totalRow);

      this.model.serializeTasks().forEach(function(task)
      {
        var taskRow = {
          task: task.name,
          total: task.total
        };

        task.companies.forEach(function(company)
        {
          taskRow[company.company] = company.count;
        });

        rows.push(taskRow);
      });

      return rows;
    },

    afterRender: function()
    {
      // Overrides the default behaviour...
    }

  });
});
